import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import {
  determineAccurateProfession,
  determineMarriageDestiny
} from "../core/CurrentLifeAndCareerDiagnosticEngine";
import { calculateDevoteeAge } from "../core/PanchangaAngaSynthesisEngine";

export interface InfluencerBenchmarkProfile {
  id: string;
  name: string;
  publicRole: string;
  birthDate: string;
  birthTime: string;
  lat: number;
  lon: number;
  gender: "Male" | "Female";
  maritalStatusInput?: "married" | "unmarried";
  expectedCareerCode: "creative_media" | "sports_athletics";
  expectedTopFieldCodes?: string[];
  expectedMarriageStatus?: "already_married" | "delayed_marriage" | "assured_marriage";
}

export const INFLUENCER_BENCHMARKS: InfluencerBenchmarkProfile[] = [
  {
    id: "kusha_kapila",
    name: "Kusha Kapila",
    publicRole: "Leading Digital Content Creator, Comedian & Fashion Influencer",
    birthDate: "1989-09-19",
    birthTime: "12:00",
    lat: 28.6139,
    lon: 77.2090,
    gender: "Female",
    maritalStatusInput: "married",
    expectedCareerCode: "creative_media",
    expectedMarriageStatus: "already_married"
  },
  {
    id: "komal_pandey",
    name: "Komal Pandey",
    publicRole: "Fashion Video Pioneer & Digital Style Icon",
    birthDate: "1994-06-18",
    birthTime: "12:00",
    lat: 28.6139,
    lon: 77.2090,
    gender: "Female",
    maritalStatusInput: "unmarried",
    expectedCareerCode: "creative_media",
    expectedMarriageStatus: "delayed_marriage"
  },
  {
    id: "bhuvan_bam",
    name: "Bhuvan Bam",
    publicRole: "YouTuber, BB Ki Vines Creator, Actor & Songwriter",
    birthDate: "1994-01-22",
    birthTime: "12:00",
    lat: 28.6139,
    lon: 77.2090,
    gender: "Male",
    maritalStatusInput: "unmarried",
    expectedCareerCode: "creative_media",
    expectedMarriageStatus: "delayed_marriage"
  },
  {
    id: "prajakta_koli",
    name: "Prajakta Koli",
    publicRole: "MostlySane Digital Creator, YouTuber & Bollywood Actress",
    birthDate: "1993-06-27",
    birthTime: "12:00",
    lat: 19.0760,
    lon: 72.8777,
    gender: "Female",
    maritalStatusInput: "unmarried",
    expectedCareerCode: "creative_media"
  },
  {
    id: "ranveer_allahbadia",
    name: "Ranveer Allahbadia",
    publicRole: "BeerBiceps, The Ranveer Show Podcaster & Digital Entrepreneur",
    birthDate: "1993-06-02",
    birthTime: "12:00",
    lat: 19.0760,
    lon: 72.8777,
    gender: "Male",
    maritalStatusInput: "unmarried",
    expectedCareerCode: "creative_media",
    expectedMarriageStatus: "delayed_marriage"
  },
  {
    id: "dolly_singh",
    name: "Dolly Singh",
    publicRole: "Digital Creator, Comedian & Feature Film Actress",
    birthDate: "1993-09-23",
    birthTime: "12:00",
    lat: 29.3919,
    lon: 79.4542,
    gender: "Female",
    maritalStatusInput: "unmarried",
    expectedCareerCode: "creative_media",
    expectedMarriageStatus: "delayed_marriage"
  },
  {
    id: "gaurav_taneja",
    name: "Gaurav Taneja",
    publicRole: "Flying Beast Daily Vlogger, Commercial Pilot & Bodybuilder",
    birthDate: "1986-07-09",
    birthTime: "12:00",
    lat: 26.4499,
    lon: 80.3319,
    gender: "Male",
    maritalStatusInput: "married",
    expectedCareerCode: "creative_media",
    expectedMarriageStatus: "already_married"
  },
  {
    id: "ankush_bahuguna",
    name: "Ankush Bahuguna",
    publicRole: "Men Grooming/Beauty Content Creator & Digital Comedian",
    birthDate: "1993-02-22",
    birthTime: "12:00",
    lat: 28.6139,
    lon: 77.2090,
    gender: "Male",
    maritalStatusInput: "unmarried",
    expectedCareerCode: "creative_media",
    expectedMarriageStatus: "delayed_marriage"
  },
  {
    id: "masoom_minawala",
    name: "Masoom Minawala",
    publicRole: "Global Luxury Fashion Influencer & Digital Brand Founder",
    birthDate: "1992-12-14",
    birthTime: "12:00",
    lat: 19.0760,
    lon: 72.8777,
    gender: "Female",
    maritalStatusInput: "married",
    expectedCareerCode: "creative_media",
    expectedMarriageStatus: "already_married"
  },
  {
    id: "carry_minati",
    name: "CarryMinati (Ajey Nagar)",
    publicRole: "Asia's Leading YouTuber, Gaming Streamer & Roaster",
    birthDate: "1999-06-12",
    birthTime: "12:00",
    lat: 28.4089,
    lon: 77.3178,
    gender: "Male",
    maritalStatusInput: "unmarried",
    expectedCareerCode: "creative_media"
  }
];

describe("Top 10 Indian Digital Content Creators & Influencers Benchmark Fidelity Audit", () => {
  for (const creator of INFLUENCER_BENCHMARKS) {
    it(`evaluates ${creator.name} (${creator.publicRole}) with 100% fidelity`, () => {
      const age = calculateDevoteeAge(creator.birthDate);
      const kundli = calculateKundli({
        name: creator.name,
        birthDate: creator.birthDate,
        birthTime: creator.birthTime,
        latitude: creator.lat,
        longitude: creator.lon
      });

      const prof = determineAccurateProfession(kundli, {
        devoteeName: creator.name,
        devoteeAge: age,
        gender: creator.gender
      });

      const marriage = determineMarriageDestiny(kundli, {
        devoteeName: creator.name,
        devoteeAge: age,
        gender: creator.gender,
        maritalStatus: creator.maritalStatusInput
      });

      // 1. Career Verdict Fidelity: Must identify creative_media (or include it in top 2 if dual career)
      const topCodes = prof.topSuitableFields?.slice(0, 3).map(f => f.fieldCode) || [];
      expect(
        prof.code === creator.expectedCareerCode || topCodes.includes("creative_media"),
        `Career mismatch for ${creator.name}: expected ${creator.expectedCareerCode}, got primary ${prof.code}, top 3: ${topCodes.join(", ")}`
      ).toBe(true);

      // 2. High Suitability Percentage: creative_media must have at least 75% suitability
      const creativeField = prof.topSuitableFields?.find(f => f.fieldCode === "creative_media");
      expect(creativeField).toBeDefined();
      expect(creativeField!.suitabilityPercentage).toBeGreaterThanOrEqual(75);

      // 3. Marriage Status Fidelity if specified
      if (creator.expectedMarriageStatus) {
        expect(
          marriage.verdict,
          `Marriage verdict mismatch for ${creator.name}: expected ${creator.expectedMarriageStatus}, got ${marriage.verdict}`
        ).toBe(creator.expectedMarriageStatus);
      }
    });
  }
});
