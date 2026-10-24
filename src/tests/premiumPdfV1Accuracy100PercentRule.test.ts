import { describe, it, expect } from "vitest";
import { accuracyContract } from "../features/premiumPdf/premiumPdfLocale";
import { buildPremiumPrompts } from "../features/premiumPdf/premiumPrompts";
import { BENCHMARK_20_PROFILES } from "../data/benchmarkProfiles20";
import { calculateKundli } from "../core/KundliEngine";
import { generatePanchangaAngaSynthesis } from "../core/PanchangaAngaSynthesisEngine";
import { PlanetName } from "../core/AstroTypes";

describe("Premium PDF V1 100% Accuracy & Shastriya Rule Engine Audit", () => {
  it("verifies accuracyContract provides the 100% Mathematical & Shastriya Accuracy Contract", () => {
    const contract = accuracyContract({
      name: "Ramesh Sharma",
      ageYears: 35,
      gender: "Male",
      maritalStatus: "married",
      hasChildren: "has_children",
      lang: "kn"
    });

    expect(contract).toContain("100% MATHEMATICAL & SHASTRIYA ACCURACY CONTRACT");
    expect(contract).toContain("ABSOLUTE COMPUTATIONAL FIDELITY");
    expect(contract).toContain("STRICT ZERO-TOLERANCE FOR GENERIC HOROSCOPES");
    expect(contract).toContain("INTIMATE LIVING REALITY & PSYCHOLOGICAL RESONANCE");
    expect(contract).toContain("MANDATORY LIFE-STAGE & STATUS FIDELITY");
    expect(contract).toContain("ZERO CONFUSING PERCENTAGE DISCLOSURES");
    expect(contract).toContain("Ramesh Sharma");
    expect(contract).toContain("Age: 35 years (Adult)");
  });

  it("verifies accuracyContract adapts dynamically to child, youth, adult, and senior profiles", () => {
    const childContract = accuracyContract({ name: "Little Ananya", ageYears: 4, gender: "Female" });
    expect(childContract).toContain("Age: 4 years (Child/Infant)");
    expect(childContract).toContain("Focus 100% on early cognitive development");

    const youthContract = accuracyContract({ name: "Rahul", ageYears: 19, gender: "Male" });
    expect(youthContract).toContain("Age: 19 years (Youth/Student)");
    expect(youthContract).toContain("Focus 100% on education, focus against distractions");

    const seniorContract = accuracyContract({ name: "Subramanya Bhat", ageYears: 68, gender: "Male" });
    expect(seniorContract).toContain("Age: 68 years (Senior Elder)");
    expect(seniorContract).toContain("Focus 100% on domestic serenity, lifelong companionship");
  });

  it("verifies all prompt headers in buildPremiumPrompts contain the 100% Accuracy Contract", () => {
    const prompts = buildPremiumPrompts({
      lang: "kn",
      runId: "test-run-123",
      name: "Ganesh Hegde",
      gender: "Male",
      ageYears: 42,
      maritalStatus: "married",
      hasChildren: "has_children",
      lagnaRashiIndex: 3,
      moonRashiIndex: 0,
      moonNakshatraIndex: 0,
      sunRashiIndex: 4,
      natalPlanets: [
        { graha: "Moon", rashiIndex: 0, house: 10 },
        { graha: "Sun", rashiIndex: 4, house: 2 },
        { graha: "Jupiter", rashiIndex: 3, house: 1 }
      ],
      transits: [
        { graha: "Saturn", rashiIndex: 10, houseFromMoon: 11 },
        { graha: "Jupiter", rashiIndex: 1, houseFromMoon: 2 }
      ],
      mahaLord: "Jupiter",
      bhuktiLord: "Saturn",
      bhuktiEndsAtAge: 44.5,
      engineYogas: [{ name: "Gaja Kesari Yoga", significance: "Divine wisdom and honor" }],
      engineDoshas: [],
      pariharas: [],
      shadowSelf: "Over-sacrificing for unappreciative associates",
      karmicBaggage: "Carrying ancestral responsibilities",
      lifePhase: "Ascent and stabilization",
      overallTone: "Positive",
      careerNote: "Stable leadership",
      financeNote: "Steady accumulation",
      roadmap: [{ month: "November 2026", prediction: "Financial expansion" }],
      affairNote: ""
    });

    const expectedHeaderSubstr = "100% MATHEMATICAL & SHASTRIYA ACCURACY CONTRACT — THIS OUTRANKS ALL GENERALITIES";

    expect(prompts.soulMirror).toContain(expectedHeaderSubstr);
    expect(prompts.characteristics).toContain(expectedHeaderSubstr);
    expect(prompts.darkSecret).toContain(expectedHeaderSubstr);
    expect(prompts.currentPhase).toContain(expectedHeaderSubstr);
    expect(prompts.yogas).toContain(expectedHeaderSubstr);
    expect(prompts.doshas).toContain(expectedHeaderSubstr);
    expect(prompts.gochara).toContain(expectedHeaderSubstr);
    expect(prompts.timeline).toContain(expectedHeaderSubstr);
    expect(prompts.bhavishya).toContain(expectedHeaderSubstr);
    expect(prompts.bhavishyaMarriage).toContain(expectedHeaderSubstr);
    expect(prompts.bhavishyaChildren).toContain(expectedHeaderSubstr);
    expect(prompts.bhavishyaCareer).toContain(expectedHeaderSubstr);
    expect(prompts.bhavishyaWealth).toContain(expectedHeaderSubstr);
    expect(prompts.bhavishyaHealth).toContain(expectedHeaderSubstr);
    expect(prompts.bhavishyaAnnualForecast).toContain(expectedHeaderSubstr);
    expect(prompts.summary).toContain(expectedHeaderSubstr);
    expect(prompts.maandiInquest).toContain(expectedHeaderSubstr);
    expect(prompts.dashaGocharaCompass).toContain(expectedHeaderSubstr);
  });

  it("verifies PanchangaAngaSynthesisEngine has zero '40%-50%' or '40-50%' text that confuses users about report accuracy", () => {
    // Audit a real benchmark profile through PanchangaAngaSynthesisEngine
    const profile = BENCHMARK_20_PROFILES[0]!;
    const kundli = calculateKundli({
      name: profile.name,
      birthDate: profile.birthDate,
      birthTime: profile.birthTime,
      latitude: profile.latitude,
      longitude: profile.longitude
    });

    const synthesis = generatePanchangaAngaSynthesis(kundli, {
      devoteeName: profile.name,
      birthDate: profile.birthDate,
      birthTime: profile.birthTime,
      latitude: profile.latitude,
      longitude: profile.longitude,
      gender: profile.gender,
      devoteeAge: profile.approxAgeIn2026,
      maritalStatus: profile.maritalStatus,
      lang: "kn"
    });

    const synthesisStr = JSON.stringify(synthesis);
    expect(synthesisStr).not.toContain("40%-50%");
    expect(synthesisStr).not.toContain("40-50%");
    expect(synthesisStr).not.toContain("ಕೇವಲ 40%");

    // Verify English synthesis as well
    const synthesisEn = generatePanchangaAngaSynthesis(kundli, {
      devoteeName: profile.name,
      birthDate: profile.birthDate,
      birthTime: profile.birthTime,
      latitude: profile.latitude,
      longitude: profile.longitude,
      gender: profile.gender,
      devoteeAge: profile.approxAgeIn2026,
      maritalStatus: profile.maritalStatus,
      lang: "en"
    });

    const synthesisEnStr = JSON.stringify(synthesisEn);
    expect(synthesisEnStr).not.toContain("40-50%");
    expect(synthesisEnStr).not.toContain("stalled at 40");
  });
});
