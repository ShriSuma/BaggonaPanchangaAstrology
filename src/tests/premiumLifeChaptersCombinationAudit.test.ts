import { describe, it, expect } from "vitest";
import { buildPremiumPrompts, PremiumPromptInput } from "../features/premiumPdf/premiumPrompts";
import {
  buildDynamicMarriageFallback,
  buildDynamicChildrenFallback,
  analyzeKundali
} from "../features/premiumPdf/dynamicBhavishyaEngine";

const baseInput: PremiumPromptInput = {
  lang: "kn",
  runId: "test-run-101",
  name: "Devotee Ramesh",
  gender: "Male",
  ageYears: 32,
  maritalStatus: "married",
  hasChildren: "has_children",
  lagnaRashiIndex: 0, // Mesha
  moonRashiIndex: 3, // Karka
  moonNakshatraIndex: 7, // Pushya
  sunRashiIndex: 0,
  natalPlanets: [
    { graha: "Sun", rashiIndex: 0, house: 1, exalted: true },
    { graha: "Moon", rashiIndex: 3, house: 4 },
    { graha: "Mars", rashiIndex: 9, house: 10, exalted: true },
    { graha: "Mercury", rashiIndex: 1, house: 2 },
    { graha: "Jupiter", rashiIndex: 3, house: 4, exalted: true },
    { graha: "Venus", rashiIndex: 6, house: 7 }, // 7th house lord in 7th
    { graha: "Saturn", rashiIndex: 6, house: 7, exalted: true },
    { graha: "Rahu", rashiIndex: 1, house: 2 },
    { graha: "Ketu", rashiIndex: 7, house: 8 }
  ],
  transits: [
    { graha: "Jupiter", rashiIndex: 1, houseFromMoon: 11 },
    { graha: "Saturn", rashiIndex: 10, houseFromMoon: 8 }
  ],
  mahaLord: "Jupiter",
  bhuktiLord: "Saturn",
  bhuktiEndsAtAge: 35.5,
  bhuktiEndDateFormatted: "2028-06-15",
  engineYogas: [{ name: "Gajakesari Yoga", significance: "Wisdom and respect" }],
  engineDoshas: [],
  pariharas: [],
  shadowSelf: "Inner doubt",
  karmicBaggage: "Past karma",
  lifePhase: "Ascent",
  overallTone: "Positive",
  careerNote: "Stable",
  financeNote: "Gains",
  roadmap: [{ month: "Nov 2026", prediction: "Progress" }],
  affairNote: "None"
};

describe("Premium Life Chapters Combinations & Precision Audit", () => {
  it("Audits Combination 1: Married Native with Children (32yo Adult)", () => {
    const prompts = buildPremiumPrompts({
      ...baseInput,
      maritalStatus: "married",
      hasChildren: "has_children"
    });

    // Marriage prompt checks
    expect(prompts.bhavishyaMarriage).toContain("ALREADY MARRIED WITH CHILDREN");
    expect(prompts.bhavishyaMarriage).toContain("co-parenting harmony");
    expect(prompts.bhavishyaMarriage).toContain("NEVER mention matchmaking, wedding proposals");

    // Children prompt checks
    expect(prompts.bhavishyaChildren).toContain("ALREADY HAS CHILDREN (LIVING CHILDREN)");
    expect(prompts.bhavishyaChildren).toContain("living children");
    expect(prompts.bhavishyaChildren).toContain("DO NOT WRITE ABOUT CONCEPTION DELAYS");
  });

  it("Audits Combination 2: Married Native with No Children (32yo Adult)", () => {
    const prompts = buildPremiumPrompts({
      ...baseInput,
      maritalStatus: "married",
      hasChildren: "no_children"
    });

    // Marriage prompt checks
    expect(prompts.bhavishyaMarriage).toContain("MARRIED COUPLE WITHOUT CHILDREN");
    expect(prompts.bhavishyaMarriage).toContain("ZERO MENTION OF CHILDREN, SCHOOLING, PARENTING");
    expect(prompts.bhavishyaMarriage).toContain("unbreakable united team");

    // Children prompt checks
    expect(prompts.bhavishyaChildren).toContain("COUPLE WITHOUT CHILDREN / ASPIRING FOR PROGENY");
    expect(prompts.bhavishyaChildren).toContain("heartfelt prayers and quiet longing for a child");
    expect(prompts.bhavishyaChildren).toContain("DO NOT ASSUME THEY CURRENTLY HAVE CHILDREN");
  });

  it("Audits Combination 3: Unmarried Native with No Children (27yo Adult)", () => {
    const prompts = buildPremiumPrompts({
      ...baseInput,
      ageYears: 27,
      maritalStatus: "unmarried",
      hasChildren: "no_children"
    });

    // Marriage prompt checks
    expect(prompts.bhavishyaMarriage).toContain("UNMARRIED / SEEKING LIFE PARTNER");
    expect(prompts.bhavishyaMarriage).toContain("Astrological foundation of marriage alliance");
    expect(prompts.bhavishyaMarriage).toContain("navigating alliance proposals");
    expect(prompts.bhavishyaMarriage).not.toContain("dividing domestic duties");
  });

  it("Audits Combination 4: Samanya / General (30yo Adult Astrological Deduction)", () => {
    const prompts = buildPremiumPrompts({
      ...baseInput,
      ageYears: 30,
      maritalStatus: "general",
      hasChildren: "general"
    });

    // Marriage prompt checks: 30yo adult with 7th house Saturn deduces householder domestic harmony
    expect(prompts.bhavishyaMarriage).toContain("DEDUCED: HOUSEHOLDER MANAGING MARITAL HARMONY");
    expect(prompts.bhavishyaMarriage).toContain("NEVER write 'delay in finding a wedding alliance'");
    expect(prompts.bhavishyaMarriage).not.toContain("SAMANYA / GENERAL MARITAL ANALYSIS");

    // Children prompt checks: 30yo adult (< 33) without Santana dosha deduces auspicious progeny blessing
    expect(prompts.bhavishyaChildren).toContain("DEDUCED: YOUNG ADULT WITH AUSPICIOUS PROGENY & LINEAGE BLESSING");
    expect(prompts.bhavishyaChildren).toContain("auspicious Poorva Punya, strong lineage continuity");
    expect(prompts.bhavishyaChildren).not.toContain("SAMANYA / GENERAL PROGENY & INTELLECT ANALYSIS");
  });

  it("Audits Combination 4b: Samanya / General (25yo Young Adult Astrological Deduction)", () => {
    const prompts = buildPremiumPrompts({
      ...baseInput,
      ageYears: 25,
      maritalStatus: "general",
      hasChildren: "general"
    });

    // 25yo with 7th house Saturn dosha deduces matrimonial alliance delays / matchmaking hurdles
    expect(prompts.bhavishyaMarriage).toContain("DEDUCED: YOUNG ADULT FACING VIVAHA DELAYS / DOSHA OBSTACLES");
    expect(prompts.bhavishyaMarriage).toContain("matchmaking delays in finalizing marriage alliances");
    expect(prompts.bhavishyaMarriage).toContain("Sri Kshetra Gokarna Mahabaleshwara");

    // Progeny for 25yo
    expect(prompts.bhavishyaChildren).toContain("DEDUCED: YOUNG ADULT WITH AUSPICIOUS PROGENY & LINEAGE BLESSING");
  });

  it("Audits Combination 4c: Samanya / General (38yo Householder Astrological Deduction)", () => {
    const prompts = buildPremiumPrompts({
      ...baseInput,
      ageYears: 38,
      maritalStatus: "general",
      hasChildren: "general"
    });

    // 38yo householder with school-going children
    expect(prompts.bhavishyaMarriage).toContain("DEDUCED: HOUSEHOLDER MANAGING MARITAL HARMONY");
    expect(prompts.bhavishyaChildren).toContain("DEDUCED: HOUSEHOLDER WITH SCHOLASTIC EXCELLENCE & FAMILY PRIDE");
    expect(prompts.bhavishyaChildren).toContain("virtuous, intelligent offspring whose academic accomplishments");
  });

  it("Audits Child Native (< 12 Years Old, e.g., 7yo Child)", () => {
    const prompts = buildPremiumPrompts({
      ...baseInput,
      ageYears: 7,
      maritalStatus: "general",
      hasChildren: "general"
    });

    // Child Education & Intellect instead of Marriage
    expect(prompts.bhavishyaMarriage).toContain("bhavishyaChildEducation");
    expect(prompts.bhavishyaMarriage).toContain("DO NOT mention marriage, romance, or dating");
    expect(prompts.bhavishyaMarriage).toContain("Memory power, cognitive retention");

    // Child Activities & Sports instead of Progeny
    expect(prompts.bhavishyaChildren).toContain("bhavishyaChildActivities");
    expect(prompts.bhavishyaChildren).toContain("Physical vigor, athletic stamina");
  });

  it("Audits Early Youth Native (14yo High School Student)", () => {
    const prompts = buildPremiumPrompts({
      ...baseInput,
      ageYears: 14,
      maritalStatus: "unmarried",
      hasChildren: "no_children"
    });

    // Early youth focus
    expect(prompts.bhavishyaMarriage).toContain("bhavishyaEarlyYouthFocus");
    expect(prompts.bhavishyaMarriage).toContain("Adolescent emotional composure, focus in secondary school");
    expect(prompts.bhavishyaMarriage).toContain("NEVER suggest marriage timing or romantic matchmaking");

    // Early youth studies
    expect(prompts.bhavishyaChildren).toContain("bhavishyaEarlyYouthStudies");
    expect(prompts.bhavishyaChildren).toContain("Scholastic grasping power");
    expect(prompts.bhavishyaChildren).toContain("NEVER use words like 'progeny', 'children', or 'conception'");
  });

  it("Audits College Youth Native (19yo College Student)", () => {
    const prompts = buildPremiumPrompts({
      ...baseInput,
      ageYears: 19,
      maritalStatus: "unmarried",
      hasChildren: "no_children"
    });

    // College youth focus
    expect(prompts.bhavishyaMarriage).toContain("bhavishyaCollegeYouthFocus");
    expect(prompts.bhavishyaMarriage).toContain("Higher Education Focus");
    expect(prompts.bhavishyaMarriage).toContain("NEVER suggest marriage timing or romantic matchmaking");

    // College youth studies
    expect(prompts.bhavishyaChildren).toContain("bhavishyaCollegeYouthStudies");
    expect(prompts.bhavishyaChildren).toContain("competitive entrance preparation");
  });

  it("Audits Senior Citizen (67yo Senior Native)", () => {
    const prompts = buildPremiumPrompts({
      ...baseInput,
      ageYears: 67,
      maritalStatus: "married",
      hasChildren: "has_children"
    });

    // Senior companionship
    expect(prompts.bhavishyaMarriage).toContain("bhavishyaSeniorCompanionship");
    expect(prompts.bhavishyaMarriage).toContain("SENIOR CITIZEN MANDATE (60–74 YEARS)");
    expect(prompts.bhavishyaMarriage).toContain("NEVER suggest wedding proposals or matchmaking");

    // Senior legacy & grandchildren
    expect(prompts.bhavishyaChildren).toContain("bhavishyaSeniorLegacy");
    expect(prompts.bhavishyaChildren).toContain("Joy of grandchildren (Poutra-Poutri sukha)");
  });

  it("Audits Elder Native (82yo Venerable Elder)", () => {
    const prompts = buildPremiumPrompts({
      ...baseInput,
      ageYears: 82,
      maritalStatus: "married",
      hasChildren: "has_children"
    });

    // Elder sacred companionship & moksha orientation
    expect(prompts.bhavishyaMarriage).toContain("bhavishyaElderCompanionship");
    expect(prompts.bhavishyaMarriage).toContain("SACRED ELDERHOOD MANDATE (75+ YEARS)");
    expect(prompts.bhavishyaMarriage).toContain("spiritual liberation (Moksha orientation)");

    // Elder sacred lineage
    expect(prompts.bhavishyaChildren).toContain("bhavishyaElderLegacy");
    expect(prompts.bhavishyaChildren).toContain("Grand fruition of Poorva Punya through generations of family continuity");
  });

  it("Verifies Zero Mechanical Brackets or 'in Bhava' tokens across all generated prompts", () => {
    const prompts = buildPremiumPrompts(baseInput);

    // Verify no 'in Bhava' strings anywhere in prompts
    expect(prompts.bhavishyaMarriage).not.toContain("in Bhava");
    expect(prompts.bhavishyaChildren).not.toContain("in Bhava");
    expect(prompts.bhavishyaCareer).not.toContain("in Bhava");
    expect(prompts.bhavishyaWealth).not.toContain("in Bhava");
    expect(prompts.bhavishyaHealth).not.toContain("in Bhava");
    expect(prompts.bhavishya).not.toContain("in Bhava");

    // Verify strict mandate against parentheses in output
    expect(prompts.bhavishyaMarriage).toContain("STRICT FORMATTING RULE");
    expect(prompts.bhavishyaChildren).toContain("STRICT FORMATTING RULE");
  });

  it("Audits Dynamic Fallback Narration for General + General (Eliminates either/or hedge sentences)", () => {
    // 25yo Young Adult chart
    const youngChart = analyzeKundali({
      lagnaRashiIndex: 0,
      moonRashiIndex: 3,
      natalPlanets: baseInput.natalPlanets,
      ageYears: 25,
      gender: "Male",
      lang: "kn"
    });

    const fbMar25 = buildDynamicMarriageFallback(youngChart, "general");
    const fbChd25 = buildDynamicChildrenFallback(youngChart, "general");

    // Must NOT contain old either-or hedge sentences
    expect(fbMar25).not.toContain("ಇನ್ನೂ ವಿವಾಹವಾಗದ ಜಾತಕರಿಗೆ");
    expect(fbMar25).not.toContain("ಈಗಾಗಲೇ ವಿವಾಹಿತರಾದವರಿಗೆ");
    expect(fbChd25).not.toContain("ಸಂತಾನ ಅಪೇಕ್ಷಿತರಿಗೆ");
    expect(fbChd25).not.toContain("ಈಗಾಗಲೇ ಮಕ್ಕಳನ್ನು ಹೊಂದಿರುವವರಿಗೆ");

    // 35yo Core Householder chart
    const householderChart = analyzeKundali({
      lagnaRashiIndex: 0,
      moonRashiIndex: 3,
      natalPlanets: baseInput.natalPlanets,
      ageYears: 35,
      gender: "Male",
      lang: "kn"
    });

    const fbMar35 = buildDynamicMarriageFallback(householderChart, "general");
    const fbChd35 = buildDynamicChildrenFallback(householderChart, "general");

    expect(fbMar35).toContain("ಗೃಹಸ್ಥ ಜೀವನದಲ್ಲಿ");
    expect(fbMar35).not.toContain("ಇನ್ನೂ ವಿವಾಹವಾಗದ ಜಾತಕರಿಗೆ");
    expect(fbChd35).not.toContain("ಸಂತಾನ ಅಪೇಕ್ಷಿತರಿಗೆ");

    // English version checks
    const enChart = analyzeKundali({
      lagnaRashiIndex: 0,
      moonRashiIndex: 3,
      natalPlanets: baseInput.natalPlanets,
      ageYears: 25,
      gender: "Male",
      lang: "en"
    });

    const fbMarEn = buildDynamicMarriageFallback(enChart, "general");
    const fbChdEn = buildDynamicChildrenFallback(enChart, "general");

    expect(fbMarEn).not.toContain("For alliance seekers, current transits");
    expect(fbMarEn).not.toContain("for married natives, this planetary current");
    expect(fbChdEn).not.toContain("For natives contemplating parenthood");
    expect(fbChdEn).not.toContain("for natives who already have children");
  });
});
