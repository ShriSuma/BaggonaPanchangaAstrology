import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import {
  generatePanchangaAngaSynthesis,
  calculateDevoteeAge
} from "../core/PanchangaAngaSynthesisEngine";

export interface InternetBenchmarkProfile {
  id: string;
  name: string;
  publicRole: string;
  birthDate: string;
  birthTime: string;
  lat: number;
  lon: number;
  gender: "Male" | "Female";
  maritalStatusGroundTruth: string;
  maritalStatusInput?: string;
  expectedCareerCode: string;
  expectedCareerDesc: string;
  expectedMarriageVerdict: "already_married" | "lifelong_celibacy_denial" | "delayed_marriage" | "assured_marriage";
  isExpectedTeetotaler: boolean;
}

/**
 * 10 Well-Documented Internet Benchmark Profiles + Manoj Poornamatha
 * Publicly verifiable character, career, marital status (married, bachelor, or sanyasi)
 */
export const TEN_INTERNET_BENCHMARKS: InternetBenchmarkProfile[] = [
  {
    id: "barack_obama",
    name: "Barack Obama",
    publicRole: "44th US President, Constitutional Scholar & Nobel Peace Laureate",
    birthDate: "1961-08-04",
    birthTime: "19:24",
    lat: 21.3069,
    lon: -157.8583,
    gender: "Male",
    maritalStatusGroundTruth: "Married to Michelle Robinson since 1992 (Age 31)",
    maritalStatusInput: "married",
    expectedCareerCode: "government_civil_police",
    expectedCareerDesc: "Head of State, Governance, Constitutional Law & Civil Authority",
    expectedMarriageVerdict: "already_married",
    isExpectedTeetotaler: false // Brewed White House Honey Ale on White House grounds, campaign beers
  },
  {
    id: "elon_musk",
    name: "Elon Musk",
    publicRole: "CEO of Tesla, SpaceX, xAI & Software Technologist",
    birthDate: "1971-06-28",
    birthTime: "06:30",
    lat: -25.7479,
    lon: 28.2293,
    gender: "Male",
    maritalStatusGroundTruth: "Married Justine Wilson (2000), later Talulah Riley",
    maritalStatusInput: "married",
    expectedCareerCode: "it_software",
    expectedCareerDesc: "Advanced Technology, High-Tech Systems & Software Engineering",
    expectedMarriageVerdict: "already_married",
    isExpectedTeetotaler: false // Drinks whiskey & red wine, smoked joint live on Joe Rogan
  },
  {
    id: "mark_zuckerberg",
    name: "Mark Zuckerberg",
    publicRole: "Founder & CEO of Meta Platforms, Tech Visionary",
    birthDate: "1984-05-14",
    birthTime: "14:39",
    lat: 41.0339,
    lon: -73.7629,
    gender: "Male",
    maritalStatusGroundTruth: "Married Priscilla Chan in 2012 (Age 28)",
    maritalStatusInput: "married",
    expectedCareerCode: "it_software",
    expectedCareerDesc: "Software Architecture, Algorithms & Digital Platforms",
    expectedMarriageVerdict: "already_married",
    isExpectedTeetotaler: false // Social beer culture, feeds beer to ranch cattle
  },
  {
    id: "jeff_bezos",
    name: "Jeff Bezos",
    publicRole: "Founder of Amazon, Commercial Tycoon & Blue Origin Pioneer",
    birthDate: "1964-01-12",
    birthTime: "11:15",
    lat: 35.0844,
    lon: -106.6504,
    gender: "Male",
    maritalStatusGroundTruth: "Married MacKenzie Tuttle in 1993 (Age 29)",
    maritalStatusInput: "married",
    expectedCareerCode: "business_realestate",
    expectedCareerDesc: "Commercial Enterprise, Large Corporate Business & Wealth Creation",
    expectedMarriageVerdict: "already_married",
    isExpectedTeetotaler: false // Wine room & whiskey cellar in DC mansion, Grand Cru red wines
  },
  {
    id: "virat_kohli",
    name: "Virat Kohli",
    publicRole: "Cricket Legend, World Cup Champion & Indian National Captain",
    birthDate: "1988-11-05",
    birthTime: "10:28",
    lat: 28.6139,
    lon: 77.209,
    gender: "Male",
    maritalStatusGroundTruth: "Married Anushka Sharma in 2017 (Age 29)",
    maritalStatusInput: "married",
    expectedCareerCode: "sports_athletics",
    expectedCareerDesc: "Professional Athletics, Competitive Cricket & Sports Valor",
    expectedMarriageVerdict: "already_married",
    isExpectedTeetotaler: true
  },
  {
    id: "rahul_gandhi",
    name: "Rahul Gandhi",
    publicRole: "Leader of Opposition, Senior Parliamentarian & Statesman",
    birthDate: "1970-06-19",
    birthTime: "14:28",
    lat: 28.6139,
    lon: 77.209,
    gender: "Male",
    maritalStatusGroundTruth: "Lifelong Bachelor (Unmarried at 54+ years)",
    maritalStatusInput: "unmarried",
    expectedCareerCode: "government_civil_police",
    expectedCareerDesc: "Parliamentary Politics, National Governance & Public Service",
    expectedMarriageVerdict: "lifelong_celibacy_denial",
    isExpectedTeetotaler: true
  },
  {
    id: "salman_khan",
    name: "Salman Khan",
    publicRole: "Bollywood Megastar, Action Hero & Producer",
    birthDate: "1965-12-27",
    birthTime: "14:37",
    lat: 22.7196,
    lon: 75.8577,
    gender: "Male",
    maritalStatusGroundTruth: "Lifelong Bachelor (Unmarried at 58+ years)",
    maritalStatusInput: "unmarried",
    expectedCareerCode: "creative_media",
    expectedCareerDesc: "Cinema, Action Film Production, Mass Acting & Screen Magnetism",
    expectedMarriageVerdict: "lifelong_celibacy_denial",
    isExpectedTeetotaler: false // Known social lifestyle / Rahu in 2nd house
  },
  {
    id: "viswanathan_anand",
    name: "Viswanathan Anand",
    publicRole: "5-Time World Chess Champion & Grandmaster",
    birthDate: "1969-12-11",
    birthTime: "04:30",
    lat: 13.0827,
    lon: 80.2707,
    gender: "Male",
    maritalStatusGroundTruth: "Married Aruna in 1996 (Age 27)",
    maritalStatusInput: "married",
    expectedCareerCode: "sports_athletics",
    expectedCareerDesc: "Professional Chess Strategy, Mind Sports & Intellectual Athletics",
    expectedMarriageVerdict: "already_married",
    isExpectedTeetotaler: true
  },
  {
    id: "sri_sri_ravi_shankar",
    name: "Sri Sri Ravi Shankar",
    publicRole: "Global Spiritual Master, Founder of Art of Living & Vedantic Humanitarian",
    birthDate: "1956-05-13",
    birthTime: "17:00",
    lat: 10.9267,
    lon: 79.2804,
    gender: "Male",
    maritalStatusGroundTruth: "Lifelong Celibate Monk / Sanyasi",
    maritalStatusInput: "unmarried",
    expectedCareerCode: "priest_vedic_astrology",
    expectedCareerDesc: "Spiritual Preaching, Vedic Dharma, Meditation & Global Humanitarianism",
    expectedMarriageVerdict: "lifelong_celibacy_denial",
    isExpectedTeetotaler: true
  },
  {
    id: "sadhguru_jaggi_vasudev",
    name: "Sadhguru (Jaggi Vasudev)",
    publicRole: "Yogi, Mystic, Founder of Isha Foundation & Author",
    birthDate: "1957-09-03",
    birthTime: "23:54",
    lat: 12.2958,
    lon: 76.6394,
    gender: "Male",
    maritalStatusGroundTruth: "Formerly Married to Vijaykumari (Grihastha before monkhood)",
    maritalStatusInput: "married",
    expectedCareerCode: "priest_vedic_astrology",
    expectedCareerDesc: "Yogic Science, Spiritual Philosophy, Ashram Preaching & Mystic Wisdom",
    expectedMarriageVerdict: "already_married",
    isExpectedTeetotaler: true
  },
  // --- 10 Additional New Verified Public Figures ---
  {
    id: "mukesh_ambani",
    name: "Mukesh Ambani",
    publicRole: "Chairman of Reliance Industries, Industrial Tycoon & Business Magnate",
    birthDate: "1957-04-19",
    birthTime: "19:53",
    lat: 12.7993,
    lon: 45.0287,
    gender: "Male",
    maritalStatusGroundTruth: "Married to Nita Ambani in 1985 (Age 28)",
    maritalStatusInput: "married",
    expectedCareerCode: "business_realestate",
    expectedCareerDesc: "Commercial Industrial Tycoon, Energy, Telecom & Global Enterprise",
    expectedMarriageVerdict: "already_married",
    isExpectedTeetotaler: true
  },
  {
    id: "satya_nadella",
    name: "Satya Nadella",
    publicRole: "CEO of Microsoft, Tech Cloud Architect & Executive",
    birthDate: "1967-08-19",
    birthTime: "07:30",
    lat: 17.3850,
    lon: 78.4867,
    gender: "Male",
    maritalStatusGroundTruth: "Married to Anupama Nadella in 1992 (Age 25)",
    maritalStatusInput: "married",
    expectedCareerCode: "it_software",
    expectedCareerDesc: "Cloud Computing, Software Architecture, Enterprise Systems & AI",
    expectedMarriageVerdict: "already_married",
    isExpectedTeetotaler: true
  },
  {
    id: "narayana_murthy",
    name: "N. R. Narayana Murthy",
    publicRole: "Founder of Infosys, Indian IT Services Pioneer",
    birthDate: "1946-08-20",
    birthTime: "09:40",
    lat: 13.3906,
    lon: 77.8631,
    gender: "Male",
    maritalStatusGroundTruth: "Married to Sudha Kulkarni Murty in 1978 (Age 32)",
    maritalStatusInput: "married",
    expectedCareerCode: "it_software",
    expectedCareerDesc: "IT Services Architecture, Software Outsourcing & Technology Entrepreneurship",
    expectedMarriageVerdict: "already_married",
    isExpectedTeetotaler: true
  },
  {
    id: "ar_rahman",
    name: "A. R. Rahman",
    publicRole: "Oscar-Winning Music Composer & Global Cinematic Maestro",
    birthDate: "1967-01-06",
    birthTime: "05:50",
    lat: 13.0827,
    lon: 80.2707,
    gender: "Male",
    maritalStatusGroundTruth: "Married to Saira Banu in 1995 (Age 28)",
    maritalStatusInput: "married",
    expectedCareerCode: "creative_media",
    expectedCareerDesc: "Cinematic Music Composition, Sound Engineering & Global Audio Art",
    expectedMarriageVerdict: "already_married",
    isExpectedTeetotaler: true
  },
  {
    id: "raghuram_rajan",
    name: "Raghuram Rajan",
    publicRole: "Former Governor of RBI, Global Economist & Monetary Authority",
    birthDate: "1963-02-03",
    birthTime: "03:30",
    lat: 23.2599,
    lon: 77.4126,
    gender: "Male",
    maritalStatusGroundTruth: "Married to Radhika Puri in 1987 (Age 24)",
    maritalStatusInput: "married",
    expectedCareerCode: "banking_finance",
    expectedCareerDesc: "Monetary Policy, Central Banking, Macroeconomics & Financial Governance",
    expectedMarriageVerdict: "already_married",
    isExpectedTeetotaler: true
  },
  {
    id: "ramana_maharshi",
    name: "Ramana Maharshi",
    publicRole: "Supreme Advaita Sage of Arunachala, Atma-Vichara Master",
    birthDate: "1879-12-30",
    birthTime: "01:00",
    lat: 9.5292,
    lon: 78.1969,
    gender: "Male",
    maritalStatusGroundTruth: "Lifelong Celibate Sage / Sanyasi of Arunachala",
    maritalStatusInput: "unmarried",
    expectedCareerCode: "priest_vedic_astrology",
    expectedCareerDesc: "Atma-Jnani, Silent Self-Enquiry, Vedic Sanyasa & Spiritual Liberation",
    expectedMarriageVerdict: "lifelong_celibacy_denial",
    isExpectedTeetotaler: true
  },
  {
    id: "azim_premji",
    name: "Azim Premji",
    publicRole: "Founder of Wipro, Tech Visionary & World-Renowned Philanthropist",
    birthDate: "1945-07-24",
    birthTime: "18:30",
    lat: 18.9220,
    lon: 72.8347,
    gender: "Male",
    maritalStatusGroundTruth: "Married to Yasmeen Premji since 1974 (Age 29)",
    maritalStatusInput: "married",
    expectedCareerCode: "it_software",
    expectedCareerDesc: "IT Services Architecture, Global Software Enterprise & Philanthropy",
    expectedMarriageVerdict: "already_married",
    isExpectedTeetotaler: true
  },
  {
    id: "sourav_ganguly",
    name: "Sourav Ganguly",
    publicRole: "Indian Cricket Team Captain, World Cup Hero & Sports Icon",
    birthDate: "1972-07-08",
    birthTime: "08:30",
    lat: 22.5726,
    lon: 88.3639,
    gender: "Male",
    maritalStatusGroundTruth: "Married to Dona Roy in 1997 (Age 25)",
    maritalStatusInput: "married",
    expectedCareerCode: "sports_athletics",
    expectedCareerDesc: "Professional Cricket Leadership, Sports Valor & Athletic Management",
    expectedMarriageVerdict: "already_married",
    isExpectedTeetotaler: true
  },
  {
    id: "manmohan_singh",
    name: "Dr. Manmohan Singh",
    publicRole: "13th Prime Minister of India, Finance Minister & Renowned Economist",
    birthDate: "1932-09-26",
    birthTime: "14:00",
    lat: 32.9754,
    lon: 72.8617,
    gender: "Male",
    maritalStatusGroundTruth: "Married to Gursharan Kaur in 1958 (Age 26)",
    maritalStatusInput: "married",
    expectedCareerCode: "government_civil_police",
    expectedCareerDesc: "Head of Government, Prime Minister, National Economic Policy & Governance",
    expectedMarriageVerdict: "already_married",
    isExpectedTeetotaler: true
  },
  {
    id: "pv_sindhu",
    name: "P. V. Sindhu",
    publicRole: "Double Olympic Medalist, World Badminton Champion & Athlete",
    birthDate: "1995-07-05",
    birthTime: "08:30",
    lat: 17.3850,
    lon: 78.4867,
    gender: "Female",
    maritalStatusGroundTruth: "Unmarried / Focused on Olympic Athletics (Age 31, Delayed Marriage)",
    maritalStatusInput: "unmarried",
    expectedCareerCode: "sports_athletics",
    expectedCareerDesc: "World Champion Badminton, Competitive Olympic Athletics & Sports Stature",
    expectedMarriageVerdict: "delayed_marriage",
    isExpectedTeetotaler: true
  },
  {
    id: "manoj_poornamatha",
    name: "Manoj Poornamatha",
    publicRole: "Vedic Scholar, Astrologer & Temple Purohita (Kumta/Gokarna)",
    birthDate: "1993-03-16",
    birthTime: "01:40",
    lat: 14.5479,
    lon: 74.3188,
    gender: "Male",
    maritalStatusGroundTruth: "Unmarried (Age 33, Mars in 7th Kuja Dosha causes Delay is NOT Denial)",
    maritalStatusInput: "unmarried",
    expectedCareerCode: "priest_vedic_astrology",
    expectedCareerDesc: "Vedic Priesthood, Temple Puja, Homa-Havana & Astrologer",
    expectedMarriageVerdict: "delayed_marriage",
    isExpectedTeetotaler: true
  }
];

export const ALL_INTERNET_BENCHMARKS = TEN_INTERNET_BENCHMARKS;

describe("Internet Benchmark & Real-World Devotee Fidelity Audit (20 Public Figures + Manoj Poornamatha)", () => {
  TEN_INTERNET_BENCHMARKS.forEach((person) => {
    it(`evaluates ${person.name} (${person.publicRole}) with 100% accuracy on career, marriage destiny, and character`, () => {
      const age = calculateDevoteeAge(person.birthDate);
      const kundli = calculateKundli({
        name: person.name,
        birthDate: person.birthDate,
        birthTime: person.birthTime,
        latitude: person.lat,
        longitude: person.lon
      });

      const synthesis = generatePanchangaAngaSynthesis(kundli, {
        birthDate: person.birthDate,
        birthTime: person.birthTime,
        latitude: person.lat,
        longitude: person.lon,
        devoteeName: person.name,
        gender: person.gender,
        devoteeAge: age,
        maritalStatus: person.maritalStatusInput,
        lang: "kn"
      });

      const diag = synthesis.currentDiagnosis;

      // 1. Career Verdict Fidelity
      expect(
        diag.accurateProfession?.code,
        `Career mismatch for ${person.name}: expected ${person.expectedCareerCode}, got ${diag.accurateProfession?.code}`
      ).toBe(person.expectedCareerCode);

      // 2. Marriage Destiny Verdict Fidelity
      expect(
        diag.marriageDestiny?.verdict,
        `Marriage verdict mismatch for ${person.name}: expected ${person.expectedMarriageVerdict}, got ${diag.marriageDestiny?.verdict} (Ground Truth: ${person.maritalStatusGroundTruth})`
      ).toBe(person.expectedMarriageVerdict);

      // 3. Teetotaler / Clean Character Fidelity
      expect(
        diag.goodBadAnalysis?.isTeetotaler,
        `Teetotaler status mismatch for ${person.name}: expected ${person.isExpectedTeetotaler}, got ${diag.goodBadAnalysis?.isTeetotaler}`
      ).toBe(person.isExpectedTeetotaler);

      // 4. Criminal False Accusation Protection
      expect(diag.negativeShades?.violenceAggression.hasRisk).toBe(false);
      expect(diag.negativeShades?.legalBandhana.hasRisk).toBe(false);
      expect(diag.negativeShades?.financialIntegrity.hasRisk).toBe(false);
    });
  });
});

describe("Osho (Bhagwan Shree Rajneesh) Real-World Character Fidelity Audit (Non-Teetotaler & Multiple Relationships)", () => {
  it("accurately identifies Osho as non-teetotaler with multiple romantic/Tantric relationships and sensual curiosity", () => {
    const osho = {
      name: "Osho (Bhagwan Shree Rajneesh)",
      birthDate: "1931-12-11",
      birthTime: "17:13",
      lat: 23.1436,
      lon: 78.4326,
      gender: "Male" as const
    };
    const kundli = calculateKundli({
      name: osho.name,
      birthDate: osho.birthDate,
      birthTime: osho.birthTime,
      latitude: osho.lat,
      longitude: osho.lon
    });
    const synthesis = generatePanchangaAngaSynthesis(kundli, {
      birthDate: osho.birthDate,
      birthTime: osho.birthTime,
      latitude: osho.lat,
      longitude: osho.lon,
      devoteeName: osho.name,
      gender: osho.gender,
      devoteeAge: 58,
      maritalStatus: "unmarried",
      lang: "en"
    });
    const diag = synthesis.currentDiagnosis;

    // 1. Profession: Spiritual Master / Mystic Philosophy / Tantra Preaching
    expect(diag.accurateProfession?.code).toBe("priest_vedic_astrology");

    // 2. Teetotaler: FALSE (Consumed wine, nitrous oxide, tranquilizers; rejected ascetic abstinence)
    expect(
      diag.goodBadAnalysis?.isTeetotaler,
      "Osho was famously known for wine, tranquilizers, and rejecting ascetic teetotalism"
    ).toBe(false);
    expect(diag.goodBadAnalysis?.dietSummaryEn).toContain("Alcohol");

    // 3. Sensual Exploration / Multiple Women: TRUE (Venus-Mars conjunction in 8th house)
    expect(
      diag.goodBadAnalysis?.hasMaritalFidelity,
      "Osho advocated Tantric free love and had multiple female partners"
    ).toBe(false);
    expect(diag.negativeShades?.sensualMarital.hasRisk).toBe(true);
    expect(diag.negativeShades?.sensualMarital.titleEn).toContain("Multiple Relationships");
  });
});

describe("Comprehensive 42 Famous Profiles Teetotaler Internet Ground-Truth Fidelity Audit", () => {
  const ALL_42_REAL_WORLD_BENCHMARKS = [
    // 20 Celebrity Benchmark Charts
    { name: "Narendra Modi", birthDate: "1950-09-17", birthTime: "11:00", lat: 23.78, lon: 72.64, expectedTeetotaler: true },
    { name: "Atal Bihari Vajpayee", birthDate: "1924-12-25", birthTime: "05:45", lat: 26.22, lon: 78.18, expectedTeetotaler: false }, // Enjoys evening whisky & non-veg
    { name: "Dr. APJ Abdul Kalam", birthDate: "1931-10-15", birthTime: "01:15", lat: 9.28, lon: 79.31, expectedTeetotaler: true },
    { name: "Swami Vivekananda", birthDate: "1863-01-12", birthTime: "06:33", lat: 22.57, lon: 88.36, expectedTeetotaler: true },
    { name: "Amitabh Bachchan", birthDate: "1942-10-11", birthTime: "15:30", lat: 25.43, lon: 81.84, expectedTeetotaler: true },
    { name: "Lata Mangeshkar", birthDate: "1929-09-28", birthTime: "22:40", lat: 22.71, lon: 75.85, expectedTeetotaler: true },
    { name: "Shah Rukh Khan", birthDate: "1965-11-02", birthTime: "06:25", lat: 28.61, lon: 77.20, expectedTeetotaler: false }, // 100 cigs/day, drinks alcohol
    { name: "Sachin Tendulkar", birthDate: "1973-04-24", birthTime: "13:00", lat: 18.92, lon: 72.83, expectedTeetotaler: true }, // Vow to father, never touches alcohol
    { name: "Bill Gates", birthDate: "1955-10-28", birthTime: "22:00", lat: 47.60, lon: -122.33, expectedTeetotaler: false }, // Light beer at baseball, $900M Heineken
    { name: "Dhirubhai Ambani", birthDate: "1932-12-28", birthTime: "06:37", lat: 21.01, lon: 70.23, expectedTeetotaler: true },
    { name: "Mahatma Gandhi", birthDate: "1869-10-02", birthTime: "07:11", lat: 21.64, lon: 69.60, expectedTeetotaler: true },
    { name: "Albert Einstein", birthDate: "1879-03-14", birthTime: "11:30", lat: 48.40, lon: 9.98, expectedTeetotaler: false }, // Pipe smoker, occasional wine/cognac
    { name: "Subhash Chandra Bose", birthDate: "1897-01-23", birthTime: "12:10", lat: 20.46, lon: 85.88, expectedTeetotaler: true },
    { name: "Indira Gandhi", birthDate: "1917-11-19", birthTime: "23:11", lat: 25.43, lon: 81.84, expectedTeetotaler: true },
    { name: "Ratan Tata", birthDate: "1937-12-28", birthTime: "06:30", lat: 18.92, lon: 72.83, expectedTeetotaler: true },
    { name: "Mother Teresa", birthDate: "1910-08-26", birthTime: "14:25", lat: 42.00, lon: 21.43, expectedTeetotaler: true },
    { name: "Rajinikanth", birthDate: "1950-12-12", birthTime: "23:54", lat: 12.97, lon: 77.59, expectedTeetotaler: false }, // Heavy drinking/smoking in early career
    { name: "Steve Jobs", birthDate: "1955-02-24", birthTime: "19:15", lat: 37.77, lon: -122.41, expectedTeetotaler: false }, // Wine/beer test with employees, LSD in youth
    { name: "MS Dhoni", birthDate: "1981-07-07", birthTime: "11:15", lat: 23.34, lon: 85.31, expectedTeetotaler: true },
    { name: "Warren Buffett", birthDate: "1930-08-30", birthTime: "15:00", lat: 41.26, lon: -95.94, expectedTeetotaler: true }, // Never drank alcohol, only Coca-Cola

    // 20 Internet Benchmark Profiles + Manoj + Osho
    { name: "Barack Obama", birthDate: "1961-08-04", birthTime: "19:24", lat: 21.3069, lon: -157.8583, expectedTeetotaler: false }, // White House Honey Ale, Beer Summit
    { name: "Elon Musk", birthDate: "1971-06-28", birthTime: "06:30", lat: -25.7479, lon: 28.2293, expectedTeetotaler: false }, // Whiskey, red wine, Joe Rogan joint
    { name: "Mark Zuckerberg", birthDate: "1984-05-14", birthTime: "14:39", lat: 41.0339, lon: -73.7629, expectedTeetotaler: false }, // Beer culture, feeds beer to cattle
    { name: "Jeff Bezos", birthDate: "1964-01-12", birthTime: "11:15", lat: 35.0844, lon: -106.6504, expectedTeetotaler: false }, // Whiskey cellar & wine room
    { name: "Virat Kohli", birthDate: "1988-11-05", birthTime: "10:28", lat: 28.6139, lon: 77.209, expectedTeetotaler: true },
    { name: "Rahul Gandhi", birthDate: "1970-06-19", birthTime: "14:28", lat: 28.6139, lon: 77.209, expectedTeetotaler: true },
    { name: "Salman Khan", birthDate: "1965-12-27", birthTime: "14:37", lat: 22.7196, lon: 75.8577, expectedTeetotaler: false },
    { name: "Viswanathan Anand", birthDate: "1969-12-11", birthTime: "04:30", lat: 13.0827, lon: 80.2707, expectedTeetotaler: true },
    { name: "Sri Sri Ravi Shankar", birthDate: "1956-05-13", birthTime: "17:00", lat: 10.9267, lon: 79.2804, expectedTeetotaler: true },
    { name: "Sadhguru (Jaggi Vasudev)", birthDate: "1957-09-03", birthTime: "23:54", lat: 12.2958, lon: 76.6394, expectedTeetotaler: true },
    { name: "Mukesh Ambani", birthDate: "1957-04-19", birthTime: "19:53", lat: 12.7993, lon: 45.0287, expectedTeetotaler: true },
    { name: "Satya Nadella", birthDate: "1967-08-19", birthTime: "07:30", lat: 17.3850, lon: 78.4867, expectedTeetotaler: true },
    { name: "N. R. Narayana Murthy", birthDate: "1946-08-20", birthTime: "09:40", lat: 13.3906, lon: 77.8631, expectedTeetotaler: true },
    { name: "A. R. Rahman", birthDate: "1967-01-06", birthTime: "05:50", lat: 13.0827, lon: 80.2707, expectedTeetotaler: true },
    { name: "Raghuram Rajan", birthDate: "1963-02-03", birthTime: "03:30", lat: 23.2599, lon: 77.4126, expectedTeetotaler: true },
    { name: "Ramana Maharshi", birthDate: "1879-12-30", birthTime: "01:00", lat: 9.5292, lon: 78.1969, expectedTeetotaler: true },
    { name: "Azim Premji", birthDate: "1945-07-24", birthTime: "18:30", lat: 18.9220, lon: 72.8347, expectedTeetotaler: true },
    { name: "Sourav Ganguly", birthDate: "1972-07-08", birthTime: "08:30", lat: 22.5726, lon: 88.3639, expectedTeetotaler: true },
    { name: "Dr. Manmohan Singh", birthDate: "1932-09-26", birthTime: "14:00", lat: 32.9754, lon: 72.8617, expectedTeetotaler: true },
    { name: "P. V. Sindhu", birthDate: "1995-07-05", birthTime: "08:30", lat: 17.3850, lon: 78.4867, expectedTeetotaler: true },
    { name: "Manoj Poornamatha", birthDate: "1993-03-16", birthTime: "01:40", lat: 14.5479, lon: 74.3188, expectedTeetotaler: true },
    { name: "Osho (Bhagwan Shree Rajneesh)", birthDate: "1931-12-11", birthTime: "17:13", lat: 23.1436, lon: 78.4326, expectedTeetotaler: false } // Wine, tranquilizers, Tantra
  ];

  ALL_42_REAL_WORLD_BENCHMARKS.forEach((person) => {
    it(`evaluates teetotaler status with 100% fidelity for ${person.name} (Expected: ${person.expectedTeetotaler})`, () => {
      const kundli = calculateKundli({
        name: person.name,
        birthDate: person.birthDate,
        birthTime: person.birthTime,
        latitude: person.lat,
        longitude: person.lon
      });
      const synthesis = generatePanchangaAngaSynthesis(kundli, {
        birthDate: person.birthDate,
        birthTime: person.birthTime,
        latitude: person.lat,
        longitude: person.lon,
        devoteeName: person.name,
        gender: "Male",
        devoteeAge: 40,
        maritalStatus: "married",
        lang: "en"
      });
      const isTeetotaler = synthesis.currentDiagnosis.goodBadAnalysis?.isTeetotaler;
      expect(
        isTeetotaler,
        `Mismatch for ${person.name}: expected ${person.expectedTeetotaler}, got ${isTeetotaler}`
      ).toBe(person.expectedTeetotaler);
    });
  });
});


