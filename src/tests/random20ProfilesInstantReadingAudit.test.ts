import { describe, it, expect } from "vitest";
import { calculateKundli } from "../core/KundliEngine";
import {
  generatePanchangaAngaSynthesis,
  calculateDevoteeAge,
  detectNativeDietAndAddiction
} from "../core/PanchangaAngaSynthesisEngine";

// Load stored test profiles from existing test suites and benchmark data
import { BENCHMARK_20_PROFILES } from "../data/benchmarkProfiles20";
import { BENCHMARK_25_PROFILES } from "../data/benchmarkProfiles25";
import groundTruth20 from "./fixtures/twentyNewInternetBenchmarksGroundTruth.json";
import { BENCHMARK_16_PROFILES } from "./comprehensive16InternetBenchmarkAudit.test";

// Unified Test Profile Interface
export interface UnifiedTestProfile {
  id: string;
  name: string;
  category: string;
  publicRole: string;
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  gender: "Male" | "Female";
  maritalStatusInput?: "married" | "unmarried" | "divorced" | "separated";
  
  // Ground truth expectations
  expectedCareerCodes: string[];
  expectedMarriageVerdict?: "already_married" | "delayed_marriage" | "lifelong_celibacy_denial" | "assured_marriage";
  expectedIsTeetotaler?: boolean | "smoking_only";
  expectedNegativeRisk?: {
    hasAffairRisk?: boolean;
    hasCriminalOrPrisonRisk?: boolean;
    hasViolenceRisk?: boolean;
    hasScamRisk?: boolean;
  };
  expectedLifeSituationCategory?: string;
  groundTruthSummary: string;
}

// Convert all stored profiles into the unified representation
const allProfilesMap = new Map<string, UnifiedTestProfile>();

// 1. From twentyNewInternetBenchmarksGroundTruth.json (20 profiles)
for (const p of groundTruth20) {
  allProfilesMap.set(p.name, {
    id: p.id,
    name: p.name,
    category: p.category,
    publicRole: p.publicRole,
    birthDate: p.birthDate,
    birthTime: p.birthTime,
    latitude: p.lat,
    longitude: p.lon,
    gender: p.gender as "Male" | "Female",
    maritalStatusInput: p.maritalStatusInput as any,
    expectedCareerCodes: [p.expectedCareerCode],
    expectedMarriageVerdict: p.expectedMarriageVerdict as any,
    expectedIsTeetotaler: p.isExpectedTeetotaler,
    expectedLifeSituationCategory: p.expectedCurrentLifeCategory,
    groundTruthSummary: `${p.publicRole} | ${p.maritalStatusGroundTruth} | Teetotaler: ${p.isExpectedTeetotaler}`
  });
}

// 2. From BENCHMARK_25_PROFILES (25 profiles)
for (const p of BENCHMARK_25_PROFILES) {
  const existing = allProfilesMap.get(p.name);
  if (!existing) {
    allProfilesMap.set(p.name, {
      id: p.id,
      name: p.name,
      category: p.category,
      publicRole: p.expectedRole,
      birthDate: p.birthDate,
      birthTime: p.birthTime,
      latitude: p.latitude,
      longitude: p.longitude,
      gender: p.gender,
      maritalStatusInput: p.maritalStatus,
      expectedCareerCodes: [p.expectedCareerCode],
      expectedIsTeetotaler: p.expectedIsTeetotaler,
      expectedNegativeRisk: {
        hasAffairRisk: p.expectedDim1Risk,
        hasCriminalOrPrisonRisk: p.expectedDim4Risk,
        hasViolenceRisk: p.expectedDim3Risk,
        hasScamRisk: p.expectedDim2Risk
      },
      groundTruthSummary: `${p.expectedRole} | Criminal: ${p.criminalStatus} | Wives: ${p.wivesCount}`
    });
  } else {
    if (!existing.expectedNegativeRisk) {
      existing.expectedNegativeRisk = {
        hasAffairRisk: p.expectedDim1Risk,
        hasCriminalOrPrisonRisk: p.expectedDim4Risk,
        hasViolenceRisk: p.expectedDim3Risk,
        hasScamRisk: p.expectedDim2Risk
      };
    }
  }
}

// 3. From BENCHMARK_16_PROFILES (16 profiles)
for (const p of BENCHMARK_16_PROFILES) {
  const existing = allProfilesMap.get(p.name);
  if (!existing) {
    allProfilesMap.set(p.name, {
      id: p.id,
      name: p.name,
      category: p.category,
      publicRole: p.publicRole,
      birthDate: p.birthDate,
      birthTime: p.birthTime,
      latitude: p.latitude,
      longitude: p.longitude,
      gender: p.gender,
      maritalStatusInput: p.maritalStatusInput,
      expectedCareerCodes: p.internetFacts.expectedCareerCodes,
      expectedIsTeetotaler: p.internetFacts.teetotaler,
      groundTruthSummary: `${p.publicRole} | ${p.internetFacts.professionDomain} | Fidelity: ${p.internetFacts.fidelityType}`
    });
  } else {
    if (existing.expectedCareerCodes.length === 1 && p.internetFacts.expectedCareerCodes.length > 1) {
      existing.expectedCareerCodes = Array.from(new Set([...existing.expectedCareerCodes, ...p.internetFacts.expectedCareerCodes]));
    }
  }
}

// 4. From BENCHMARK_20_PROFILES (20 profiles)
for (const p of BENCHMARK_20_PROFILES) {
  const existing = allProfilesMap.get(p.name);
  if (!existing) {
    allProfilesMap.set(p.name, {
      id: p.id,
      name: p.name,
      category: p.ageBracket,
      publicRole: `${p.ageBracket} (${p.internetGroundTruth.primaryFieldAndInterests[0] || "Public Figure"})`,
      birthDate: p.birthDate,
      birthTime: p.birthTime,
      latitude: p.latitude,
      longitude: p.longitude,
      gender: p.gender,
      maritalStatusInput: p.maritalStatus,
      expectedCareerCodes: p.internetGroundTruth.expectedVocationCodes || [],
      expectedLifeSituationCategory: p.internetGroundTruth.expectedLifeStageCategory,
      groundTruthSummary: `Age ~${p.approxAgeIn2026} | ${p.internetGroundTruth.primaryFieldAndInterests.join("; ")}`
    });
  }
}

const allProfiles = Array.from(allProfilesMap.values());

// Seeded pseudo-random shuffle to pick a repeatable random 20 profiles
function seededShuffle<T>(array: T[], seed: number = 42): T[] {
  const arr = [...array];
  let m = arr.length, t, i;
  let s = seed;
  const nextRandom = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  while (m) {
    i = Math.floor(nextRandom() * m--);
    t = arr[m];
    arr[m] = arr[i];
    arr[i] = t;
  }
  return arr;
}

const shuffled = seededShuffle(allProfiles, 20261002);
const random20Profiles = shuffled.slice(0, 20);

interface AuditScore {
  name: string;
  category: string;
  careerMatch: boolean;
  careerGot: string;
  careerExpected: string;
  marriageMatch: boolean;
  marriageGot: string;
  marriageExpected: string;
  dietMatch: boolean;
  dietGot: string;
  dietExpected: string;
  situationOrMoralityMatch: boolean;
  matchedDimensions: number;
  totalDimensions: number;
  accuracyPercent: number;
  overallStatus: "MATCH" | "FAIL";
  notes: string[];
}

describe("Instant Reading Validation on 20 Random Test Profiles", () => {
  const auditScores: AuditScore[] = [];

  it("verifies the pool has over 60 stored test profiles and selects exactly 20", () => {
    expect(allProfiles.length).toBeGreaterThanOrEqual(60);
    expect(random20Profiles.length).toBe(20);
  });

  for (let i = 0; i < random20Profiles.length; i++) {
    const profile = random20Profiles[i];

    it(`[Profile ${i + 1}/20] Runs Instant Reading for ${profile.name} (${profile.category})`, () => {
      const age = calculateDevoteeAge(profile.birthDate);
      const kundli = calculateKundli({
        name: profile.name,
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        latitude: profile.latitude,
        longitude: profile.longitude,
        gender: profile.gender
      });

      expect(kundli).toBeDefined();

      const synthesis = generatePanchangaAngaSynthesis(kundli, {
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        latitude: profile.latitude,
        longitude: profile.longitude,
        devoteeName: profile.name,
        gender: profile.gender,
        devoteeAge: age,
        maritalStatus: profile.maritalStatusInput,
        lang: "kn"
      });

      const diag = synthesis.currentDiagnosis;
      const diet = detectNativeDietAndAddiction(kundli);
      const shades = diag.negativeShades;
      const marriage = diag.marriageDestiny;

      const notes: string[] = [];
      let dimensionsChecked = 0;
      let dimensionsMatched = 0;

      // 1. Career / Vocation Match
      const topCodes = (diag.accurateProfession?.topSuitableFields || []).map(f => f.fieldCode);
      const primaryCode = diag.accurateProfession?.code || "";
      let isCareerMatch = false;

      if (profile.expectedCareerCodes.length > 0) {
        dimensionsChecked++;
        isCareerMatch = profile.expectedCareerCodes.some(ec => 
          ec === primaryCode || topCodes.slice(0, 3).includes(ec as any)
        );
        if (isCareerMatch) {
          dimensionsMatched++;
        } else {
          notes.push(`Career mismatch: Got '${primaryCode}' (top: ${topCodes.slice(0, 3).join(", ")}) vs expected '${profile.expectedCareerCodes.join(" | ")}'`);
        }
      } else {
        isCareerMatch = true;
      }

      // 2. Marriage Destiny Match
      let isMarriageMatch = true;
      if (profile.expectedMarriageVerdict && age >= 16) {
        dimensionsChecked++;
        const verdictGot = marriage?.verdict;
        isMarriageMatch = verdictGot === profile.expectedMarriageVerdict;
        if (isMarriageMatch) {
          dimensionsMatched++;
        } else {
          notes.push(`Marriage mismatch: Got '${verdictGot}' vs expected '${profile.expectedMarriageVerdict}'`);
        }
      }

      // 3. Diet / Teetotaler Match
      let isDietMatch = true;
      if (profile.expectedIsTeetotaler !== undefined) {
        dimensionsChecked++;
        isDietMatch = diet.isTeetotaler === profile.expectedIsTeetotaler;
        if (isDietMatch) {
          dimensionsMatched++;
        } else {
          notes.push(`Diet mismatch: Got teetotaler=${diet.isTeetotaler} vs expected=${profile.expectedIsTeetotaler}`);
        }
      }

      // 4. Morality / Shadow Risk / Life Situation Match
      let isSituationOrMoralityMatch = true;
      if (profile.expectedNegativeRisk) {
        dimensionsChecked++;
        let passNegative = true;
        if (profile.expectedNegativeRisk.hasCriminalOrPrisonRisk !== undefined) {
          const gotPrisonRisk = shades?.legalBandhana?.hasRisk ?? false;
          if (gotPrisonRisk !== profile.expectedNegativeRisk.hasCriminalOrPrisonRisk) {
            passNegative = false;
          }
        }
        if (profile.expectedNegativeRisk.hasAffairRisk !== undefined) {
          const gotAffairRisk = shades?.sensualMarital?.hasRisk ?? false;
          if (gotAffairRisk !== profile.expectedNegativeRisk.hasAffairRisk) {
            passNegative = false;
          }
        }
        if (passNegative) {
          dimensionsMatched++;
        } else {
          notes.push(`Shadow/Risk mismatch: prison=${shades?.legalBandhana?.hasRisk}, affair=${shades?.sensualMarital?.hasRisk}`);
          isSituationOrMoralityMatch = false;
        }
      } else if (profile.expectedLifeSituationCategory) {
        dimensionsChecked++;
        const gotCategory = diag.currentLifeSituation?.category;
        isSituationOrMoralityMatch = Boolean(gotCategory === profile.expectedLifeSituationCategory || (
          (profile.expectedLifeSituationCategory === "creative_media_stardom" && gotCategory?.includes("creative")) ||
          (profile.expectedLifeSituationCategory === "elite_sports_athletic_triumph" && gotCategory?.includes("sports")) ||
          (profile.expectedLifeSituationCategory === "leadership_expansion_scaling" && gotCategory?.includes("leadership"))
        ));
        if (isSituationOrMoralityMatch) {
          dimensionsMatched++;
        } else {
          notes.push(`Life situation mismatch: Got '${gotCategory}' vs expected '${profile.expectedLifeSituationCategory}'`);
        }
      }

      const accuracyPercent = dimensionsChecked > 0 ? Math.round((dimensionsMatched / dimensionsChecked) * 100) : 100;
      const overallStatus: "MATCH" | "FAIL" = (notes.length === 0 || accuracyPercent >= 75) ? "MATCH" : "FAIL";

      auditScores.push({
        name: profile.name,
        category: profile.category,
        careerMatch: isCareerMatch,
        careerGot: primaryCode,
        careerExpected: profile.expectedCareerCodes.join(", "),
        marriageMatch: isMarriageMatch,
        marriageGot: marriage?.verdict || "N/A",
        marriageExpected: profile.expectedMarriageVerdict || "N/A",
        dietMatch: isDietMatch,
        dietGot: diet.isTeetotaler ? "Teetotaler" : "Non-Teetotaler",
        dietExpected: profile.expectedIsTeetotaler !== undefined ? (profile.expectedIsTeetotaler ? "Teetotaler" : "Non-Teetotaler") : "N/A",
        situationOrMoralityMatch: isSituationOrMoralityMatch,
        matchedDimensions: dimensionsMatched,
        totalDimensions: dimensionsChecked,
        accuracyPercent,
        overallStatus,
        notes
      });

      // Basic assertion that Instant Reading successfully evaluated the native
      expect(synthesis.multiParagraphExecutiveReading.length).toBeGreaterThan(0);
      expect(synthesis.panchanga.nakshatra).toBeDefined();
    });
  }

  it("prints the comprehensive 20-profile Instant Reading Scorecard and summarizes Matching vs Failing", () => {
    expect(auditScores.length).toBe(20);

    const matchingCount = auditScores.filter(s => s.overallStatus === "MATCH").length;
    const failingCount = auditScores.filter(s => s.overallStatus === "FAIL").length;

    console.log("\n================================================================================");
    console.log("             INSTANT READING AUDIT: 20 RANDOM STORED TEST PROFILES              ");
    console.log("================================================================================");
    console.log(
      "Idx | Native Name            | Category           | Career | Marriage | Diet | Life/Moral | Status | Score"
    );
    console.log("--------------------------------------------------------------------------------");

    auditScores.forEach((s, idx) => {
      const pad = (str: string, len: number) => (str || "").slice(0, len).padEnd(len);
      const icon = s.overallStatus === "MATCH" ? "MATCH" : "FAIL";
      console.log(
        `${String(idx + 1).padStart(2)}  | ${pad(s.name, 22)} | ${pad(s.category, 18)} | ${s.careerMatch ? "PASS  " : "FAIL  "} | ${s.marriageMatch ? "PASS    " : "FAIL    "} | ${s.dietMatch ? "PASS" : "FAIL"} | ${s.situationOrMoralityMatch ? "PASS      " : "FAIL      "} | ${icon.padEnd(6)} | ${s.accuracyPercent}%`
      );
      if (s.notes.length > 0) {
        s.notes.forEach(n => console.log(`      * ${n}`));
      }
    });

    console.log("================================================================================");
    console.log(`TOTAL EVALUATED : 20 PROFILES`);
    console.log(`TOTAL MATCHING  : ${matchingCount} (${(matchingCount / 20 * 100).toFixed(1)}%)`);
    console.log(`TOTAL FAILING   : ${failingCount} (${(failingCount / 20 * 100).toFixed(1)}%)`);
    console.log(`ACCURACY RATING : ${(matchingCount / 20 * 100).toFixed(1)}%`);
    console.log("================================================================================\n");

    // Expect at least 85% matching across diverse real-world profiles
    expect(matchingCount).toBeGreaterThanOrEqual(17);
  });
});
