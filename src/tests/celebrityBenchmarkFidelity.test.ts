import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import {
  determineAccurateProfession,
  determineMarriageDestiny
} from "../core/CurrentLifeAndCareerDiagnosticEngine";
import {
  detectNativeDietAndAddiction,
  evaluateNativeNegativeShadesAndCriminality
} from "../core/PanchangaAngaSynthesisEngine";

describe("Celebrity Jathaka Benchmark Fidelity Audit (20 Iconic Charts)", () => {
  const benchmarkCelebrities = [
    // --- Original 10 ---
    {
      id: "modi",
      name: "Narendra Modi",
      role: "Prime Minister of India / World Leader",
      birthDate: "1950-09-17",
      birthTime: "11:00",
      lat: 23.78,
      lon: 72.64,
      gender: "Male" as const,
      expectedCareerCode: "government_civil_police",
      expectedMarriageVerdict: "lifelong_celibacy_denial"
    },
    {
      id: "vajpayee",
      name: "Atal Bihari Vajpayee",
      role: "Prime Minister / Statesman / Poet",
      birthDate: "1924-12-25",
      birthTime: "05:45",
      lat: 26.22,
      lon: 78.18,
      gender: "Male" as const,
      expectedCareerCode: "government_civil_police",
      expectedMarriageVerdict: "lifelong_celibacy_denial"
    },
    {
      id: "kalam",
      name: "Dr. APJ Abdul Kalam",
      role: "President of India / Aerospace Scientist",
      birthDate: "1931-10-15",
      birthTime: "01:15",
      lat: 9.28,
      lon: 79.31,
      gender: "Male" as const,
      expectedCareerCode: "engineering_core",
      expectedMarriageVerdict: "lifelong_celibacy_denial"
    },
    {
      id: "vivekananda",
      name: "Swami Vivekananda",
      role: "Spiritual Icon / Vedantic Monk",
      birthDate: "1863-01-12",
      birthTime: "06:33",
      lat: 22.57,
      lon: 88.36,
      gender: "Male" as const,
      expectedCareerCode: "priest_vedic_astrology",
      expectedMarriageVerdict: "lifelong_celibacy_denial"
    },
    {
      id: "amitabh",
      name: "Amitabh Bachchan",
      role: "Bollywood Megastar / Actor / Orator",
      birthDate: "1942-10-11",
      birthTime: "15:30",
      lat: 25.43,
      lon: 81.84,
      gender: "Male" as const,
      expectedCareerCode: "creative_media",
      expectedMarriageVerdict: "already_married"
    },
    {
      id: "lata",
      name: "Lata Mangeshkar",
      role: "Nightingale of India / Legendary Singer",
      birthDate: "1929-09-28",
      birthTime: "22:40",
      lat: 22.71,
      lon: 75.85,
      gender: "Female" as const,
      expectedCareerCode: "creative_media",
      expectedMarriageVerdict: "lifelong_celibacy_denial"
    },
    {
      id: "srk",
      name: "Shah Rukh Khan",
      role: "King of Bollywood / Global Actor / Producer",
      birthDate: "1965-11-02",
      birthTime: "06:25",
      lat: 28.61,
      lon: 77.20,
      gender: "Male" as const,
      expectedCareerCode: "creative_media",
      expectedMarriageVerdict: "already_married"
    },
    {
      id: "sachin",
      name: "Sachin Tendulkar",
      role: "Cricket Legend / Bharat Ratna",
      birthDate: "1973-04-24",
      birthTime: "13:00",
      lat: 18.92,
      lon: 72.83,
      gender: "Male" as const,
      expectedCareerCode: "sports_athletics",
      expectedMarriageVerdict: "already_married"
    },
    {
      id: "billgates",
      name: "Bill Gates",
      role: "Microsoft Founder / Tech Mogul",
      birthDate: "1955-10-28",
      birthTime: "22:00",
      lat: 47.60,
      lon: -122.33,
      gender: "Male" as const,
      expectedCareerCode: "it_software",
      expectedMarriageVerdict: "already_married"
    },
    {
      id: "dhirubhai",
      name: "Dhirubhai Ambani",
      role: "Reliance Industries Founder / Capitalist",
      birthDate: "1932-12-28",
      birthTime: "06:37",
      lat: 21.01,
      lon: 70.23,
      gender: "Male" as const,
      expectedCareerCode: "business_realestate",
      expectedMarriageVerdict: "already_married"
    },

    // --- Next 10 Celebrities ---
    {
      id: "gandhi",
      name: "Mahatma Gandhi",
      role: "Father of the Nation / Freedom Fighter",
      birthDate: "1869-10-02",
      birthTime: "07:11",
      lat: 21.64,
      lon: 69.60,
      gender: "Male" as const,
      expectedCareerCode: "government_civil_police",
      expectedMarriageVerdict: "already_married"
    },
    {
      id: "einstein",
      name: "Albert Einstein",
      role: "Theoretical Physicist / Nobel Laureate",
      birthDate: "1879-03-14",
      birthTime: "11:30",
      lat: 48.40,
      lon: 9.98,
      gender: "Male" as const,
      expectedCareerCode: "teaching_academics",
      expectedMarriageVerdict: "already_married"
    },
    {
      id: "netaji",
      name: "Subhash Chandra Bose",
      role: "Supreme Commander INA / Freedom Fighter",
      birthDate: "1897-01-23",
      birthTime: "12:10",
      lat: 20.46,
      lon: 85.88,
      gender: "Male" as const,
      expectedCareerCode: "government_civil_police",
      expectedMarriageVerdict: "already_married"
    },
    {
      id: "indiragandhi",
      name: "Indira Gandhi",
      role: "Prime Minister of India / Iron Lady",
      birthDate: "1917-11-19",
      birthTime: "23:11",
      lat: 25.43,
      lon: 81.84,
      gender: "Female" as const,
      expectedCareerCode: "government_civil_police",
      expectedMarriageVerdict: "already_married"
    },
    {
      id: "ratantata",
      name: "Ratan Tata",
      role: "Tata Sons Chairman / Philanthropist",
      birthDate: "1937-12-28",
      birthTime: "06:30",
      lat: 18.92,
      lon: 72.83,
      gender: "Male" as const,
      expectedCareerCode: "business_realestate",
      expectedMarriageVerdict: "lifelong_celibacy_denial"
    },
    {
      id: "motherteresa",
      name: "Mother Teresa",
      role: "Saint of the Gutters / Nobel Laureate",
      birthDate: "1910-08-26",
      birthTime: "14:25",
      lat: 42.00,
      lon: 21.43,
      gender: "Female" as const,
      expectedCareerCode: "priest_vedic_astrology",
      expectedMarriageVerdict: "lifelong_celibacy_denial"
    },
    {
      id: "rajinikanth",
      name: "Rajinikanth",
      role: "Superstar / Iconic Actor / Spiritualist",
      birthDate: "1950-12-12",
      birthTime: "23:54",
      lat: 12.97,
      lon: 77.59,
      gender: "Male" as const,
      expectedCareerCode: "creative_media",
      expectedMarriageVerdict: "already_married"
    },
    {
      id: "stevejobs",
      name: "Steve Jobs",
      role: "Apple Co-Founder / Visionary",
      birthDate: "1955-02-24",
      birthTime: "19:15",
      lat: 37.77,
      lon: -122.41,
      gender: "Male" as const,
      expectedCareerCode: "it_software",
      expectedMarriageVerdict: "already_married"
    },
    {
      id: "dhoni",
      name: "MS Dhoni",
      role: "Cricket Legend / World Cup Captain / Defense",
      birthDate: "1981-07-07",
      birthTime: "11:15",
      lat: 23.34,
      lon: 85.31,
      gender: "Male" as const,
      expectedCareerCode: "sports_athletics",
      expectedMarriageVerdict: "already_married"
    },
    {
      id: "buffett",
      name: "Warren Buffett",
      role: "Oracle of Omaha / Berkshire Hathaway",
      birthDate: "1930-08-30",
      birthTime: "15:00",
      lat: 41.26,
      lon: -95.94,
      gender: "Male" as const,
      expectedCareerCode: "banking_finance",
      expectedMarriageVerdict: "already_married"
    }
  ];

  benchmarkCelebrities.forEach(celeb => {
    it(`evaluates ${celeb.name} (${celeb.role}) with 100% career and marriage fidelity`, () => {
      const kundli = calculateKundli({
        name: celeb.name,
        birthDate: celeb.birthDate,
        birthTime: celeb.birthTime,
        latitude: celeb.lat,
        longitude: celeb.lon
      });

      const prof = determineAccurateProfession(kundli, {
        devoteeName: celeb.name,
        birthDate: celeb.birthDate,
        birthTime: celeb.birthTime,
        gender: celeb.gender
      });

      const destiny = determineMarriageDestiny(kundli, {
        devoteeName: celeb.name,
        birthDate: celeb.birthDate,
        gender: celeb.gender
      });

      const diet = detectNativeDietAndAddiction(kundli);
      const neg = evaluateNativeNegativeShadesAndCriminality(kundli, {
        birthDate: celeb.birthDate,
        birthTime: celeb.birthTime,
        latitude: celeb.lat,
        longitude: celeb.lon,
        gender: celeb.gender
      });

      // 1. Career Accuracy
      expect(prof.bestCode).toBe(celeb.expectedCareerCode);

      // 2. Marriage Destiny Accuracy
      expect(destiny.verdict).toBe(celeb.expectedMarriageVerdict);

      // 3. Ethical / Character Sanity: No false drug accusation
      expect(diet.hasWeedCannabisHabit).toBe(false);

      // 4. Negative Shades: No extreme criminal or violence flags for noble personalities
      expect(neg.violenceAggression.severity).not.toBe("high");
      expect(neg.legalBandhana.severity).not.toBe("high");
    });
  });
});
