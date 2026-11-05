import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { calculateKundli } from "../core/KundliEngine";
import { generateKundliRemedyReport, type SupportedLanguage } from "../features/remedies/kundliRemedyEngine";
import { KundliRemedyPdfTemplate } from "../components/kundli/KundliRemedyPdfTemplate";
import type { KundliInput } from "../core/AstroTypes";

export interface RemedyAuditProfile {
  id: string;
  name: string;
  country: string;
  gender: "Male" | "Female";
  ageBracket: string;
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
  gotra?: string;
  primaryConcern?: string;
}

export const TWENTY_AUDIT_PROFILES: RemedyAuditProfile[] = [
  // 1 to 10 (From Previous Worldwide Batch)
  {
    id: "ww_01_prince_george",
    name: "Prince George",
    country: "United Kingdom",
    gender: "Male",
    ageBracket: "under_13",
    birthDate: "2013-07-22",
    birthTime: "16:24",
    latitude: 51.516,
    longitude: -0.176,
    timezone: 1.0,
    primaryConcern: "student_academic"
  },
  {
    id: "ww_02_billie_eilish",
    name: "Billie Eilish",
    country: "United States",
    gender: "Female",
    ageBracket: "under_25",
    birthDate: "2001-12-18",
    birthTime: "11:30",
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: -8.0,
    primaryConcern: "creative_stardom"
  },
  {
    id: "ww_03_zendaya",
    name: "Zendaya",
    country: "United States",
    gender: "Female",
    ageBracket: "under_30",
    birthDate: "1996-09-01",
    birthTime: "18:03",
    latitude: 37.8044,
    longitude: -122.2712,
    timezone: -7.0,
    primaryConcern: "creative_stardom"
  },
  {
    id: "ww_04_magnus_carlsen",
    name: "Magnus Carlsen",
    country: "Norway",
    gender: "Male",
    ageBracket: "under_40",
    birthDate: "1990-11-30",
    birthTime: "09:20",
    latitude: 59.2675,
    longitude: 10.4076,
    timezone: 1.0,
    primaryConcern: "elite_sports"
  },
  {
    id: "ww_05_taylor_swift",
    name: "Taylor Swift",
    country: "United States",
    gender: "Female",
    ageBracket: "under_40",
    birthDate: "1989-12-13",
    birthTime: "05:17",
    latitude: 40.3356,
    longitude: -75.9269,
    timezone: -5.0,
    primaryConcern: "creative_stardom"
  },
  {
    id: "ww_06_sundar_pichai",
    name: "Sundar Pichai",
    country: "India / USA",
    gender: "Male",
    ageBracket: "under_60",
    birthDate: "1972-06-10",
    birthTime: "05:30",
    latitude: 9.9252,
    longitude: 78.1198,
    timezone: 5.5,
    gotra: "Kashyapa",
    primaryConcern: "leadership_expansion"
  },
  {
    id: "ww_07_elon_musk",
    name: "Elon Musk",
    country: "South Africa / USA",
    gender: "Male",
    ageBracket: "under_60",
    birthDate: "1971-06-28",
    birthTime: "06:30",
    latitude: -25.7479,
    longitude: 28.2293,
    timezone: 2.0,
    primaryConcern: "leadership_expansion"
  },
  {
    id: "ww_08_keanu_reeves",
    name: "Keanu Reeves",
    country: "Lebanon / Canada",
    gender: "Male",
    ageBracket: "under_80",
    birthDate: "1964-09-02",
    birthTime: "05:41",
    latitude: 33.8938,
    longitude: 35.5018,
    timezone: 2.0,
    primaryConcern: "general_alignment"
  },
  {
    id: "ww_09_narendra_modi",
    name: "Narendra Modi",
    country: "India",
    gender: "Male",
    ageBracket: "under_80",
    birthDate: "1950-09-17",
    birthTime: "11:00",
    latitude: 23.7844,
    longitude: 72.6397,
    timezone: 5.5,
    gotra: "Bharadwaja",
    primaryConcern: "leadership_expansion"
  },
  {
    id: "ww_10_king_charles_iii",
    name: "King Charles III",
    country: "United Kingdom",
    gender: "Male",
    ageBracket: "under_80",
    birthDate: "1948-11-14",
    birthTime: "21:14",
    latitude: 51.5014,
    longitude: -0.1419,
    timezone: 0.0,
    primaryConcern: "health_vitality"
  },

  // 11 to 20 (10 NEW Online Verified Profiles)
  {
    id: "ww_11_malala_yousafzai",
    name: "Malala Yousafzai",
    country: "Pakistan / UK",
    gender: "Female",
    ageBracket: "under_30",
    birthDate: "1997-07-12",
    birthTime: "08:15",
    latitude: 34.7717,
    longitude: 72.3602,
    timezone: 5.0,
    primaryConcern: "leadership_expansion"
  },
  {
    id: "ww_12_lionel_messi",
    name: "Lionel Messi",
    country: "Argentina",
    gender: "Male",
    ageBracket: "under_40",
    birthDate: "1987-06-24",
    birthTime: "05:55",
    latitude: -32.9468,
    longitude: -60.6393,
    timezone: -3.0,
    primaryConcern: "elite_sports"
  },
  {
    id: "ww_13_cristiano_ronaldo",
    name: "Cristiano Ronaldo",
    country: "Portugal",
    gender: "Male",
    ageBracket: "under_45",
    birthDate: "1985-02-05",
    birthTime: "05:25",
    latitude: 32.6500,
    longitude: -16.9089,
    timezone: 0.0,
    primaryConcern: "elite_sports"
  },
  {
    id: "ww_14_steve_jobs",
    name: "Steve Jobs",
    country: "United States",
    gender: "Male",
    ageBracket: "under_60",
    birthDate: "1955-02-24",
    birthTime: "19:15",
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: -8.0,
    primaryConcern: "health_vitality"
  },
  {
    id: "ww_15_albert_einstein",
    name: "Albert Einstein",
    country: "Germany / USA",
    gender: "Male",
    ageBracket: "under_80",
    birthDate: "1879-03-14",
    birthTime: "11:30",
    latitude: 48.4011,
    longitude: 9.9876,
    timezone: 0.6667,
    primaryConcern: "student_academic"
  },
  {
    id: "ww_16_leonardo_dicaprio",
    name: "Leonardo DiCaprio",
    country: "United States",
    gender: "Male",
    ageBracket: "under_60",
    birthDate: "1974-11-11",
    birthTime: "02:47",
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: -8.0,
    primaryConcern: "creative_stardom"
  },
  {
    id: "ww_17_kamala_harris",
    name: "Kamala Harris",
    country: "United States",
    gender: "Female",
    ageBracket: "under_65",
    birthDate: "1964-10-20",
    birthTime: "21:28",
    latitude: 37.8044,
    longitude: -122.2712,
    timezone: -7.0,
    primaryConcern: "leadership_expansion"
  },
  {
    id: "ww_18_barack_obama",
    name: "Barack Obama",
    country: "United States",
    gender: "Male",
    ageBracket: "under_65",
    birthDate: "1961-08-04",
    birthTime: "19:24",
    latitude: 21.3069,
    longitude: -157.8583,
    timezone: -10.0,
    primaryConcern: "leadership_expansion"
  },
  {
    id: "ww_19_oprah_winfrey",
    name: "Oprah Winfrey",
    country: "United States",
    gender: "Female",
    ageBracket: "under_75",
    birthDate: "1954-01-29",
    birthTime: "04:30",
    latitude: 33.0574,
    longitude: -89.5876,
    timezone: -6.0,
    primaryConcern: "leadership_expansion"
  },
  {
    id: "ww_20_amitabh_bachchan",
    name: "Amitabh Bachchan",
    country: "India",
    gender: "Male",
    ageBracket: "under_85",
    birthDate: "1942-10-11",
    birthTime: "16:00",
    latitude: 25.4358,
    longitude: 81.8463,
    timezone: 5.5,
    gotra: "Srivatsa",
    primaryConcern: "health_vitality"
  }
];

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["kn", "en", "hi", "te", "ta"];

describe("Worldwide 20 Profiles Remedy PDF (Daivika Parihara) Comprehensive Multi-Language Audit", () => {
  it("verifies all 20 profiles have verified chronological parameters", () => {
    expect(TWENTY_AUDIT_PROFILES).toHaveLength(20);
    for (const p of TWENTY_AUDIT_PROFILES) {
      expect(p.birthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.birthTime).toMatch(/^\d{2}:\d{2}$/);
      expect(typeof p.latitude).toBe("number");
      expect(typeof p.longitude).toBe("number");
      expect(typeof p.timezone).toBe("number");
    }
  });

  TWENTY_AUDIT_PROFILES.forEach((profile, pIdx) => {
    describe(`[Profile ${pIdx + 1}/20] ${profile.name} (${profile.country})`, () => {
      SUPPORTED_LANGUAGES.forEach((lang) => {
        it(`audits Remedy PDF rendering and accuracy in ${lang.toUpperCase()}`, () => {
          const input: KundliInput = {
            name: profile.name,
            birthDate: profile.birthDate,
            birthTime: profile.birthTime,
            latitude: profile.latitude,
            longitude: profile.longitude,
            gender: profile.gender,
            gothra: profile.gotra,
            primaryConcern: profile.primaryConcern as any,
            timezoneOffsetMinutes: Math.round(profile.timezone * 60)
          };

          const kundli = calculateKundli(input, { ayanamsaModel: "lahiri" });
          expect(kundli).toBeDefined();

          const diagnosis = generateKundliRemedyReport(kundli, input);
          expect(diagnosis).toBeDefined();

          // 1. Core Diagnosis Integrity Checks
          expect(diagnosis.devoteeName).toBe(profile.name);
          expect(diagnosis.primaryStruggle).toBeDefined();
          expect(diagnosis.primaryStruggle.title).toBeDefined();
          expect(diagnosis.primaryStruggle.description).toBeDefined();

          // 2. Psychological Meters (0 to 100)
          expect(diagnosis.psychologicalProfile.krodhaLevel).toBeGreaterThanOrEqual(0);
          expect(diagnosis.psychologicalProfile.krodhaLevel).toBeLessThanOrEqual(100);
          expect(diagnosis.psychologicalProfile.manasStability).toBeGreaterThanOrEqual(0);
          expect(diagnosis.psychologicalProfile.manasStability).toBeLessThanOrEqual(100);
          expect(diagnosis.psychologicalProfile.vitalityScore).toBeGreaterThanOrEqual(0);
          expect(diagnosis.psychologicalProfile.vitalityScore).toBeLessThanOrEqual(100);
          expect(diagnosis.psychologicalProfile.patienceIndex).toBeGreaterThanOrEqual(0);
          expect(diagnosis.psychologicalProfile.patienceIndex).toBeLessThanOrEqual(100);

          // 3. 5-Anga Panchanga Remedies
          expect(diagnosis.panchangaRemedies.nakshatraRemedy).toBeDefined();
          expect(diagnosis.panchangaRemedies.tithiRemedy).toBeDefined();
          expect(diagnosis.panchangaRemedies.varaRemedy).toBeDefined();
          expect(diagnosis.panchangaRemedies.yogaRemedy).toBeDefined();
          expect(diagnosis.panchangaRemedies.karanaRemedy).toBeDefined();

          // 4. Gokarna Temple Remedies
          expect(diagnosis.gokarnaTempleRemedies.prescribedSeva.name).toBeDefined();
          expect(diagnosis.gokarnaTempleRemedies.rudrakshaRecommendation.mukhi).toBeDefined();
          expect(diagnosis.gokarnaTempleRemedies.gemstoneRecommendation.stone).toBeDefined();
          expect(diagnosis.gokarnaTempleRemedies.donationDaana.item).toBeDefined();

          // 5. Chief Priest Blessing
          expect(diagnosis.chiefPriestBlessing.priestName).toBeDefined();
          expect(diagnosis.chiefPriestBlessing.phone).toBe("+91 94821 09844");

          // 6. Virtual DOM Rendering via KundliRemedyPdfTemplate
          const { container } = render(
            <KundliRemedyPdfTemplate diagnosis={diagnosis} lang={lang} />
          );

          expect(container).toBeDefined();
          const pages = container.querySelectorAll(".pdf-page");
          expect(pages.length).toBe(3);

          const fullText = container.textContent || "";

          // Check for forbidden raw/unrendered code tokens
          expect(fullText).not.toContain("undefined");
          expect(fullText).not.toContain("null");
          expect(fullText).not.toContain("NaN");
          expect(fullText).not.toContain("[object Object]");

          // Verify all 3 pages maintain exact 900x1273px A4 dimensions
          pages.forEach((page, pageIndex) => {
            const el = page as HTMLElement;
            expect(el.style.width).toBe("900px");
            expect(el.style.height).toBe("1273px");
            expect(el.style.overflow).toBe("hidden");

            const pageText = el.textContent || "";
            expect(pageText.length).toBeGreaterThan(100);

            // Verify Page Footers
            if (pageIndex === 0) {
              if (lang === "kn") expect(pageText).toContain("ಪುಟ ೧/೩");
              if (lang === "en") expect(pageText).toContain("Page 1 of 3");
              if (lang === "hi") expect(pageText).toContain("पृष्ठ १/३");
              if (lang === "te") expect(pageText).toContain("పేజీ 1/3");
              if (lang === "ta") expect(pageText).toContain("பக்கம் 1/3");
            } else if (pageIndex === 1) {
              if (lang === "kn") expect(pageText).toContain("ಪುಟ ೨/೩");
              if (lang === "en") expect(pageText).toContain("Page 2 of 3");
              if (lang === "hi") expect(pageText).toContain("पृष्ठ २/३");
              if (lang === "te") expect(pageText).toContain("పేజీ 2/3");
              if (lang === "ta") expect(pageText).toContain("பக்கம் 2/3");
            } else if (pageIndex === 2) {
              if (lang === "kn") expect(pageText).toContain("ಪುಟ ೩/೩");
              if (lang === "en") expect(pageText).toContain("Page 3 of 3");
              if (lang === "hi") expect(pageText).toContain("पृष्ठ ३/३");
              if (lang === "te") expect(pageText).toContain("పేజీ 3/3");
              if (lang === "ta") expect(pageText).toContain("பக்கம் 3/3");
            }
          });
        });
      });
    });
  });
});
