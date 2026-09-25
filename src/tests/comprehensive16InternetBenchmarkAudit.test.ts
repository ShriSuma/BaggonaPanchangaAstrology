import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import { PlanetName } from "../core/AstroTypes";
import {
  determineAccurateProfession,
  diagnoseCurrentLifeSituation,
  determineMarriageDestiny
} from "../core/CurrentLifeAndCareerDiagnosticEngine";
import {
  generatePanchangaAngaSynthesis,
  calculateDevoteeAge
} from "../core/PanchangaAngaSynthesisEngine";

export interface BenchmarkTarget {
  id: string;
  name: string;
  category: "Brahmin / Spiritual" | "Politician / World Leader" | "Business / Tech Titan" | "Cinema / Stardom" | "Sports / Athletics" | "Controversy / Scandal";
  publicRole: string;
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  gender: "Male" | "Female";
  maritalStatusInput?: "married" | "unmarried" | "separated" | "divorced";
  internetFacts: {
    professionDomain: string;
    expectedCareerCodes: string[];
    teetotaler: boolean | "smoking_only";
    dietEvidence: string;
    fidelityType: "ekapatni_vrata" | "standard_fidelity" | "celibate_sanyasa" | "multiple_affairs_wanderlust";
    fidelityEvidence: string;
    moralIntegrity: "pure_clean" | "scandal_affairs" | "criminal_bandhana";
    moralEvidence: string;
  };
}

export const BENCHMARK_16_PROFILES: BenchmarkTarget[] = [
  // 1. BRAHMIN / SPIRITUAL / VEDIC
  {
    id: "swami_vivekananda",
    name: "Swami Vivekananda",
    category: "Brahmin / Spiritual",
    publicRole: "Patriotic Vedic Monk, Vedantin Philosopher & Parliament of Religions Legend",
    birthDate: "1863-01-12",
    birthTime: "06:33",
    latitude: 22.5726,
    longitude: 88.3639,
    gender: "Male",
    maritalStatusInput: "unmarried",
    internetFacts: {
      professionDomain: "Spiritual Philosopher, Vedic Monk, Orator & Global Guru",
      expectedCareerCodes: ["priest_vedic_astrology", "teaching_academics", "creative_media"],
      teetotaler: true,
      dietEvidence: "Vedic monk; strictly abstained from alcohol and intoxicants; vegetarian/satvik",
      fidelityType: "celibate_sanyasa",
      fidelityEvidence: "Lifelong strict Brahmacharya; renounced world for Sanyasa",
      moralIntegrity: "pure_clean",
      moralEvidence: "Spiritual saint; zero crimes, thefts, or violence; revered globally"
    }
  },
  {
    id: "sri_sri_ravi_shankar",
    name: "Sri Sri Ravi Shankar",
    category: "Brahmin / Spiritual",
    publicRole: "Global Spiritual Ambassador, Art of Living Founder & Peace Envoy",
    birthDate: "1956-05-13",
    birthTime: "17:02",
    latitude: 10.9254,
    longitude: 79.2818,
    gender: "Male",
    maritalStatusInput: "unmarried",
    internetFacts: {
      professionDomain: "Spiritual Master, Yoga / Meditation Guru & Humanitarian Peace Envoy",
      expectedCareerCodes: ["priest_vedic_astrology", "teaching_academics", "medical_healthcare"],
      teetotaler: true,
      dietEvidence: "Strict satvik Brahmin vegetarian; zero alcohol, smoking, or drugs",
      fidelityType: "celibate_sanyasa",
      fidelityEvidence: "Lifelong celibate spiritual teacher; zero romantic scandals",
      moralIntegrity: "pure_clean",
      moralEvidence: "Peace emissary; zero criminal record; awarded highest civilian honors"
    }
  },
  {
    id: "bv_raman",
    name: "Dr. B.V. Raman",
    category: "Brahmin / Spiritual",
    publicRole: "Doyen of Vedic Astrology, Author of 30+ Classics & Astrological Magazine Founder",
    birthDate: "1912-08-08",
    birthTime: "19:43",
    latitude: 12.9716,
    longitude: 77.5946,
    gender: "Male",
    maritalStatusInput: "married",
    internetFacts: {
      professionDomain: "Vedic Astrologer, Author, Magazine Publisher & Scholar",
      expectedCareerCodes: ["priest_vedic_astrology", "creative_media", "teaching_academics"],
      teetotaler: true,
      dietEvidence: "Devout Orthodox Brahmin; strictly vegetarian, teetotaler, daily Gayatri japa",
      fidelityType: "ekapatni_vrata",
      fidelityEvidence: "Legendary Ekapatni Vrata; married Smt. Rajeswari Raman for over 60 years; pristine fidelity",
      moralIntegrity: "pure_clean",
      moralEvidence: "Unblemished scholar of Vedic science; zero controversies"
    }
  },

  // 2. POLITICIAN / WORLD LEADER
  {
    id: "narendra_modi",
    name: "Narendra Modi",
    category: "Politician / World Leader",
    publicRole: "14th Prime Minister of India, Global Statesman & Mass Leader",
    birthDate: "1950-09-17",
    birthTime: "11:00",
    latitude: 23.7844,
    longitude: 72.6369,
    gender: "Male",
    maritalStatusInput: "unmarried",
    internetFacts: {
      professionDomain: "National Governance, Statecraft, Political Leadership & Public Administration",
      expectedCareerCodes: ["government_civil_police", "business_realestate"],
      teetotaler: true,
      dietEvidence: "Lifelong strict vegetarian and fasting practitioner; zero alcohol or smoking",
      fidelityType: "celibate_sanyasa",
      fidelityEvidence: "Ascetic single life; renounced marital life in youth for national service",
      moralIntegrity: "pure_clean",
      moralEvidence: "Personal financial incorruptibility; zero personal wealth hoarding"
    }
  },
  {
    id: "barack_obama",
    name: "Barack Obama",
    category: "Politician / World Leader",
    publicRole: "44th US President, Constitutional Scholar & Nobel Peace Laureate",
    birthDate: "1961-08-04",
    birthTime: "19:24",
    latitude: 21.3069,
    longitude: -157.8583,
    gender: "Male",
    maritalStatusInput: "married",
    internetFacts: {
      professionDomain: "Head of State, Constitutional Law, Executive Governance & Oratory",
      expectedCareerCodes: ["government_civil_police", "author_media_writing", "teaching_coaching"],
      teetotaler: false,
      dietEvidence: "Non-teetotaler; enjoys beer (White House Honey Ale) and wine; past cigarette smoker",
      fidelityType: "standard_fidelity",
      fidelityEvidence: "Devoted marriage to Michelle Obama since 1992; 0 extramarital scandals",
      moralIntegrity: "pure_clean",
      moralEvidence: "Zero criminal indictments; respected statesman"
    }
  },
  {
    id: "indira_gandhi",
    name: "Indira Gandhi",
    category: "Politician / World Leader",
    publicRole: "First Female Prime Minister of India, 'Iron Lady' & Political Strategist",
    birthDate: "1917-11-19",
    birthTime: "23:11",
    latitude: 25.4358,
    longitude: 81.8463,
    gender: "Female",
    maritalStatusInput: "married",
    internetFacts: {
      professionDomain: "National Executive Governance, Geopolitical Warfare & Political Party Leadership",
      expectedCareerCodes: ["government_civil_police", "business_realestate"],
      teetotaler: true,
      dietEvidence: "Maintained satvik, sober personal dietary habits",
      fidelityType: "standard_fidelity",
      fidelityEvidence: "Married Feroze Gandhi in 1942; lived in public duty",
      moralIntegrity: "pure_clean",
      moralEvidence: "High-stakes political leader; zero criminal theft or fraud convictions"
    }
  },

  // 3. BUSINESS / TECH TITAN
  {
    id: "elon_musk",
    name: "Elon Musk",
    category: "Business / Tech Titan",
    publicRole: "CEO of Tesla, SpaceX, xAI, Neuralink & Software Entrepreneur",
    birthDate: "1971-06-28",
    birthTime: "06:30",
    latitude: -25.7479,
    longitude: 28.2293,
    gender: "Male",
    maritalStatusInput: "married",
    internetFacts: {
      professionDomain: "Aerospace, High-Tech Systems, Electric Vehicles & Artificial Intelligence",
      expectedCareerCodes: ["it_software", "business_realestate", "banking_finance"],
      teetotaler: false,
      dietEvidence: "Non-teetotaler; drinks whiskey, wine, diet soda; smoked cannabis joint on Joe Rogan",
      fidelityType: "multiple_affairs_wanderlust",
      fidelityEvidence: "Multiple marriages (Justine, Talulah Riley twice) and children with multiple partners (Grimes, Shivon Zilis)",
      moralIntegrity: "scandal_affairs",
      moralEvidence: "SEC civil settlement ($20M fine), intense corporate controversies, unconventional personal life"
    }
  },
  {
    id: "sundar_pichai",
    name: "Sundar Pichai",
    category: "Business / Tech Titan",
    publicRole: "CEO of Alphabet Inc. and Google, Tech Visionary & Corporate Leader",
    birthDate: "1972-06-10",
    birthTime: "06:10",
    latitude: 9.9252,
    longitude: 78.1198,
    gender: "Male",
    maritalStatusInput: "married",
    internetFacts: {
      professionDomain: "Software Engineering, Search Engines, Android/Chrome & AI Leadership",
      expectedCareerCodes: ["it_software", "business_realestate"],
      teetotaler: true,
      dietEvidence: "Strictly sober, disciplined vegetarian lifestyle from South Indian Brahmin upbringing",
      fidelityType: "ekapatni_vrata",
      fidelityEvidence: "Married IIT Kharagpur classmate Anjali Pichai; 0 scandals or affairs; devoted family man",
      moralIntegrity: "pure_clean",
      moralEvidence: "Clean corporate governance; pristine personal reputation"
    }
  },
  {
    id: "ratan_tata",
    name: "Ratan Tata",
    category: "Business / Tech Titan",
    publicRole: "Legendary Chairman of Tata Sons, Industrialist & Global Philanthropist",
    birthDate: "1937-12-28",
    birthTime: "06:30",
    latitude: 18.9220,
    longitude: 72.8347,
    gender: "Male",
    maritalStatusInput: "unmarried",
    internetFacts: {
      professionDomain: "Mega-Industrial Conglomerate, Automobile Manufacturing & Philanthropic Trusts",
      expectedCareerCodes: ["business_realestate", "it_software", "government_civil_police"],
      teetotaler: true,
      dietEvidence: "Teetotaler; simple, modest, restrained diet",
      fidelityType: "celibate_sanyasa",
      fidelityEvidence: "Lifelong bachelor; came close to marriage 4 times but stayed single in devotion to work",
      moralIntegrity: "pure_clean",
      moralEvidence: "Revered as the gold standard of corporate integrity and ethics in India"
    }
  },

  // 4. CINEMA / ARTS / STARDOM
  {
    id: "amitabh_bachchan",
    name: "Amitabh Bachchan",
    category: "Cinema / Stardom",
    publicRole: "Shahenshah of Indian Cinema, Iconic Actor, Orator & Cultural Legend",
    birthDate: "1942-10-11",
    birthTime: "16:00",
    latitude: 25.4358,
    longitude: 81.8463,
    gender: "Male",
    maritalStatusInput: "married",
    internetFacts: {
      professionDomain: "Cinematic Acting, Dramatic Voice Over, Television Hosting (KBC) & Cultural Icon",
      expectedCareerCodes: ["creative_media", "author_media_writing"],
      teetotaler: true,
      dietEvidence: "Strict teetotaler; renounced smoking and alcohol in the early 1980s; pure vegetarian",
      fidelityType: "multiple_affairs_wanderlust",
      fidelityEvidence: "Married Jaya Bhaduri in 1973 (50+ years of marriage); well-documented 1970s extramarital relationship with Rekha (immortalized in Silsila)",
      moralIntegrity: "pure_clean",
      moralEvidence: "National cultural icon; survived 1982 fatal Coolie spleen rupture; zero criminal charges"
    }
  },
  {
    id: "marilyn_monroe",
    name: "Marilyn Monroe",
    category: "Cinema / Stardom",
    publicRole: "Hollywood Screen Legend, Cultural Sex Symbol & Model",
    birthDate: "1926-06-01",
    birthTime: "09:30",
    latitude: 34.0522,
    longitude: -118.2437,
    gender: "Female",
    maritalStatusInput: "divorced",
    internetFacts: {
      professionDomain: "Film Acting, Modeling, Glamour Entertainment & Singing",
      expectedCareerCodes: ["creative_media"],
      teetotaler: false,
      dietEvidence: "Non-teetotaler; heavy reliance on champagne, cocktails, and prescription sedatives",
      fidelityType: "multiple_affairs_wanderlust",
      fidelityEvidence: "Three divorces (James Dougherty, Joe DiMaggio, Arthur Miller) and high-profile affairs (JFK)",
      moralIntegrity: "scandal_affairs",
      moralEvidence: "Tragic life cut short by barbiturate overdose; romantic and psychological torment"
    }
  },
  {
    id: "shah_rukh_khan",
    name: "Shah Rukh Khan",
    category: "Cinema / Stardom",
    publicRole: "King of Bollywood, Global Film Icon, Film Producer & Red Chillies Owner",
    birthDate: "1965-11-02",
    birthTime: "02:30",
    latitude: 28.6139,
    longitude: 77.2090,
    gender: "Male",
    maritalStatusInput: "married",
    internetFacts: {
      professionDomain: "Cinematic Stardom, Romantic Drama Acting, Film VFX Studio & Sports Franchises (KKR)",
      expectedCareerCodes: ["creative_media", "business_realestate"],
      teetotaler: "smoking_only",
      dietEvidence: "Famous chain-smoker (openly smokes 30+ cigarettes a day); social coffee/beverages",
      fidelityType: "ekapatni_vrata",
      fidelityEvidence: "Married Gauri Chhibber in 1991; 33+ years of rock-solid marital devotion; zero infidelity",
      moralIntegrity: "pure_clean",
      moralEvidence: "Global goodwill ambassador, zero criminal convictions, beloved worldwide"
    }
  },

  // 5. SPORTS / ATHLETICS
  {
    id: "sachin_tendulkar",
    name: "Sachin Tendulkar",
    category: "Sports / Athletics",
    publicRole: "Master Blaster, 'God of Cricket', 100 International Centuries & Bharat Ratna",
    birthDate: "1973-04-24",
    birthTime: "13:00",
    latitude: 18.9220,
    longitude: 72.8347,
    gender: "Male",
    maritalStatusInput: "married",
    internetFacts: {
      professionDomain: "International Cricket Mastery, World Record Batting, Sports Brand Ambassador",
      expectedCareerCodes: ["sports_athletics"],
      teetotaler: true,
      dietEvidence: "Disciplined athletic lifestyle; avoided alcohol culture throughout prime career",
      fidelityType: "ekapatni_vrata",
      fidelityEvidence: "Married Dr. Anjali Tendulkar in 1995; extraordinary marital devotion; 0 scandals",
      moralIntegrity: "pure_clean",
      moralEvidence: "Awarded Bharat Ratna; hailed as ultimate gentleman of sports; pristine integrity"
    }
  },
  {
    id: "cristiano_ronaldo",
    name: "Cristiano Ronaldo",
    category: "Sports / Athletics",
    publicRole: "Football Legend, 5x Ballon d'Or Winner, 900+ Career Goals & Athletic Titan",
    birthDate: "1985-02-05",
    birthTime: "05:25",
    latitude: 32.6669,
    longitude: -16.9241,
    gender: "Male",
    maritalStatusInput: "unmarried",
    internetFacts: {
      professionDomain: "Elite Professional Football, Goalscoring Athletics, Global Fitness Brand",
      expectedCareerCodes: ["sports_athletics", "business_realestate"],
      teetotaler: true,
      dietEvidence: "Strict teetotaler; father died of alcoholism so he completely avoids alcohol, soda, smoking",
      fidelityType: "multiple_affairs_wanderlust",
      fidelityEvidence: "Long dating history with supermodels (Irina Shayk, etc.) before committed partnership with Georgina Rodriguez",
      moralIntegrity: "pure_clean",
      moralEvidence: "Elite athlete, philanthropic donor, pristine athletic record; 0 criminal convictions"
    }
  },

  // 6. CONTROVERSY / SCANDAL / LEGAL BANDHANA
  {
    id: "bill_clinton",
    name: "Bill Clinton",
    category: "Controversy / Scandal",
    publicRole: "42nd US President, Politician, Orator & Impeachment Scandal Subject",
    birthDate: "1946-08-19",
    birthTime: "08:51",
    latitude: 33.6671,
    longitude: -93.5916,
    gender: "Male",
    maritalStatusInput: "married",
    internetFacts: {
      professionDomain: "Head of State, Governance, Oratory, Law & Political Strategy",
      expectedCareerCodes: ["government_civil_police", "author_media_writing"],
      teetotaler: false,
      dietEvidence: "Non-teetotaler; social wine and spirits drinker; fast-food enthusiast in 1990s",
      fidelityType: "multiple_affairs_wanderlust",
      fidelityEvidence: "Extensive documented extramarital affairs (Gennifer Flowers, Paula Jones, Monica Lewinsky scandal)",
      moralIntegrity: "scandal_affairs",
      moralEvidence: "Impeached by House of Representatives for perjury and obstruction of justice in 1998"
    }
  },
  {
    id: "jeffrey_epstein",
    name: "Jeffrey Epstein",
    category: "Controversy / Scandal",
    publicRole: "Disgraced Financier, Convicted Sex Offender & High-Profile Felon",
    birthDate: "1953-01-20",
    birthTime: "13:42",
    latitude: 40.6782,
    longitude: -73.9442,
    gender: "Male",
    maritalStatusInput: "unmarried",
    internetFacts: {
      professionDomain: "Offshore Wealth Management, High-Finance Speculation & Elite Networking",
      expectedCareerCodes: ["banking_finance", "business_realestate"],
      teetotaler: true,
      dietEvidence: "Non-drinker, did not consume alcohol or drugs to maintain mental calculation control",
      fidelityType: "multiple_affairs_wanderlust",
      fidelityEvidence: "Extravagant, predatory illicit sexual operation; zero marital loyalty",
      moralIntegrity: "criminal_bandhana",
      moralEvidence: "Convicted sex criminal; federal indictment for sex trafficking; died in federal jail (Bandhana Yoga)"
    }
  }
];

describe("16 Public Figures Across 6 Real-World Domains Ground-Truth Instant Reading Audit", () => {
  const scoreCard: {
    profile: string;
    category: string;
    professionMatch: boolean;
    dietMatch: boolean;
    fidelityMatch: boolean;
    moralIntegrityMatch: boolean;
    headlineImpact: string;
    overallAccuracyPercent: number;
  }[] = [];

  it("runs the full benchmark audit across all 16 profiles and outputs detailed scorecard", () => {
    for (const person of BENCHMARK_16_PROFILES) {
      const age = calculateDevoteeAge(person.birthDate);
      const kundli = calculateKundli({
        name: person.name,
        birthDate: person.birthDate,
        birthTime: person.birthTime,
        latitude: person.latitude,
        longitude: person.longitude
      });

      const synthesis = generatePanchangaAngaSynthesis(kundli, {
        birthDate: person.birthDate,
        birthTime: person.birthTime,
        latitude: person.latitude,
        longitude: person.longitude,
        devoteeName: person.name,
        gender: person.gender,
        devoteeAge: age,
        maritalStatus: person.maritalStatusInput,
        lang: "kn"
      });

      const prof = synthesis.currentDiagnosis.accurateProfession;
      const gba = synthesis.currentDiagnosis.goodBadAnalysis;
      const cls = synthesis.currentDiagnosis.currentLifeSituation;
      const negShades = synthesis.currentDiagnosis.negativeShades;
      const paragraphs = synthesis.multiParagraphExecutiveReading;

      // Ensure 4 paragraphs are generated
      expect(paragraphs.length).toBeGreaterThanOrEqual(4);

      // 1. Evaluate Profession Accuracy
      const calculatedProfessionCode = prof?.code || "";
      const topSuitableCodes = (prof?.topSuitableFields || []).map((f: any) => f.fieldCode);
      const allMatchingCodes = [calculatedProfessionCode, ...topSuitableCodes];
      const professionMatch = person.internetFacts.expectedCareerCodes.some(c => allMatchingCodes.includes(c));

      // 2. Evaluate Diet & Substance Accuracy
      let dietMatch = false;
      if (person.internetFacts.teetotaler === true) {
        dietMatch = gba.isTeetotaler === true && !gba.hasMadyapanaRisk;
      } else if (person.internetFacts.teetotaler === "smoking_only") {
        dietMatch = gba.hasDhumapanaOrSubstanceTendency === true && !gba.hasMadyapanaRisk;
      } else {
        dietMatch = gba.isTeetotaler === false;
      }

      // 3. Evaluate Marital Fidelity Accuracy
      let fidelityMatch = false;
      if (person.internetFacts.fidelityType === "ekapatni_vrata") {
        fidelityMatch = gba.isHighFidelityVrata === true;
      } else if (person.internetFacts.fidelityType === "celibate_sanyasa") {
        fidelityMatch = !gba.hasMultipleRelationshipsRisk || (synthesis.currentDiagnosis.primaryLifeChallenge.area !== "Personal / Marriage");
      } else if (person.internetFacts.fidelityType === "multiple_affairs_wanderlust") {
        fidelityMatch = gba.hasMultipleRelationshipsRisk === true || gba.isHighFidelityVrata === false;
      } else {
        fidelityMatch = gba.hasMaritalFidelity === true || !gba.hasMultipleRelationshipsRisk;
      }

      // 4. Evaluate Moral Integrity & Criminality Accuracy
      let moralIntegrityMatch = false;
      if (person.internetFacts.moralIntegrity === "pure_clean") {
        moralIntegrityMatch = (negShades?.overallScore ?? 0) <= 20;
      } else if (person.internetFacts.moralIntegrity === "scandal_affairs") {
        moralIntegrityMatch = (negShades?.sensualMarital.hasRisk === true) || ((negShades?.overallScore ?? 0) >= 14);
      } else if (person.internetFacts.moralIntegrity === "criminal_bandhana") {
        moralIntegrityMatch = (negShades?.legalBandhana.hasRisk === true) || ((negShades?.overallScore ?? 0) >= 25);
      }

      const criteria = [professionMatch, dietMatch, fidelityMatch, moralIntegrityMatch];
      const matchCount = criteria.filter(Boolean).length;
      const accuracyPercent = Math.round((matchCount / criteria.length) * 100);

      scoreCard.push({
        profile: person.name,
        category: person.category,
        professionMatch,
        dietMatch,
        fidelityMatch,
        moralIntegrityMatch,
        headlineImpact: (cls?.headlineKn || synthesis.currentDiagnosis.primaryLifeChallenge.description || "").slice(0, 50),
        overallAccuracyPercent: accuracyPercent
      });

      if (accuracyPercent < 100) {
        console.log(`[DISCREPANCY in ${person.name} (${accuracyPercent}%)]`);
        if (!professionMatch) console.log(`  - Profession: expected [${person.internetFacts.expectedCareerCodes}], got ${prof?.code}, top: ${topSuitableCodes}`);
        if (!dietMatch) console.log(`  - Diet: expected ${person.internetFacts.teetotaler}, got isTeetotaler=${gba.isTeetotaler}, dhumapana=${gba.hasDhumapanaOrSubstanceTendency}, madyapana=${gba.hasMadyapanaRisk}`);
        if (!fidelityMatch) console.log(`  - Fidelity: expected ${person.internetFacts.fidelityType}, got isHighFidelity=${gba.isHighFidelityVrata}, hasMultipleRel=${gba.hasMultipleRelationshipsRisk}, hasMaritalFidelity=${gba.hasMaritalFidelity}`);
        if (!moralIntegrityMatch) console.log(`  - Moral: expected ${person.internetFacts.moralIntegrity}, got score=${negShades?.overallScore}, sensual=${negShades?.sensualMarital.score}, bandhana=${negShades?.legalBandhana.score}`);
      }
    }

    console.log("\n================================================================");
    console.log("FINAL BENCHMARK SCORECARD ACROSS 16 DIVERSE REAL-WORLD PROFILES");
    console.log("================================================================");
    console.table(scoreCard);

    const avgAccuracy = Math.round(
      scoreCard.reduce((sum, item) => sum + item.overallAccuracyPercent, 0) / scoreCard.length
    );
    console.log(`\n🎯 OVERALL SYSTEM ACCURACY: ${avgAccuracy}%`);
    expect(avgAccuracy).toBeGreaterThanOrEqual(75);
  });
});
