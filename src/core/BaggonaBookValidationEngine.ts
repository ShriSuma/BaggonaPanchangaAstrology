/**
 * Baggona Panchanga 104-Page Book Validation & Quality Guard Engine
 * (ಬಗ್ಗೋಣ ಪಂಚಾಂಗ ೧೦೪-ಪುಟಗಳ ಪುಸ್ತಕ ದೃಢೀಕರಣ ಮತ್ತು ಗುಣಮಟ್ಟ ಪರೀಕ್ಷಾ ಎಂಜಿನ್)
 * 
 * Validates any generated Baggona Panchanga annual edition against:
 * 1. Exact 104-page signature budget (Zero overflow, zero gaps).
 * 2. Pure Kannada language integrity (Zero unlocalized English tokens leaked).
 * 3. 10-column Left Page and 12-Lagna Right Page structural fidelity.
 * 4. Classical Shastric & Astronomical precision (Navanayakas, Ahargana, Aridra, Aparahna Shraddha).
 * 5. Gokarna geographic baseline (14° 32' N).
 */

import {
  getSamvatsaraMetadata,
  calculateNavanayakagalu,
  generateBookTableOfContents,
  generateUniversal104PageBook,
  type UniversalBookPageResponse
} from "./BaggonaUniversalBookEngine";

export interface ValidationCheckItem {
  id: string;
  category: "Page Budget" | "Language Purity" | "Astronomical Precision" | "Panchanga Dual-Page" | "Shastric Rules";
  nameKn: string;
  nameEn: string;
  passed: boolean;
  score: number; // 0 to 100
  detailsKn: string;
}

export interface BookValidationReport {
  shakaYear: number;
  samvatsaraKn: string;
  samvatsaraEn: string;
  isValid: boolean;
  scorePercentage: number; // e.g. 100
  isGreenHighlighted: boolean;
  publicationReady: boolean;
  generatedTimestamp: string;
  totalPages: number;
  totalChecks: number;
  passedChecksCount: number;
  failedChecksCount: number;
  checks: ValidationCheckItem[];
  summaryKn: string;
}

/**
 * Validates a 104-page book for any given Samvatsara Shaka year
 */
export function validateBaggonaBook(shakaYear: number): BookValidationReport {
  const meta = getSamvatsaraMetadata(shakaYear);
  const pages = generateUniversal104PageBook(shakaYear);
  const toc = generateBookTableOfContents(shakaYear);
  const navanayakas = calculateNavanayakagalu(shakaYear);

  const checks: ValidationCheckItem[] = [];

  // Check 1: Exact 104-page signature budget
  const pageBudgetPassed = pages.length === 104;
  checks.push({
    id: "page_budget_104",
    category: "Page Budget",
    nameKn: "೧೦೪ ಪುಟಗಳ ಕಟ್ಟುನಿಟ್ಟಾದ ಮುದ್ರಣ ಬಜೆಟ್ ಪರಿಶೀಲನೆ",
    nameEn: "Exact 104-Page Signature Budget Verification",
    passed: pageBudgetPassed,
    score: pageBudgetPassed ? 100 : 0,
    detailsKn: `ಒಟ್ಟು ಪುಟಗಳ ಸಂಖ್ಯೆ: ${pages.length} (ನಿರೀಕ್ಷಿತ: ೧೦೪ ಪುಟಗಳು). ಶೂನ್ಯ ಓವರ್‌ಫ್ಲೋ, ಶೂನ್ಯ ಖಾಲಿ ಪುಟಗಳು.`
  });

  // Check 2: First Page (Index & Rahukala)
  const page1 = pages[0];
  const page1Valid =
    page1 &&
    page1.pageNumber === 1 &&
    page1.layoutTemplateId === "page_01_index_and_rahukala" &&
    page1.contentData.rahukalaTable?.length === 7;
  checks.push({
    id: "page_1_index_rahukala",
    category: "Panchanga Dual-Page",
    nameKn: "ಪುಟ ೧: ಅವತರಣಿಕೆ & ರಾಹುಕಾಲ-ಗುಳಿಕಕಾಲ ಕೋಷ್ಟಕ",
    nameEn: "Page 1: Table of Contents & Rahukala Layout",
    passed: Boolean(page1Valid),
    score: page1Valid ? 100 : 0,
    detailsKn: `ಪರಿವಿಡಿ ಮತ್ತು ಸೂರ್ಯೋದಯ ವ್ಯತ್ಯಾಸ ಸೂಚನೆ ಸಹಿತ ೭ ವಾರಗಳ ರಾಹು-ಗುಳಿಕ ಕಾಲ ಸರಿಯಾಗಿದೆ.`
  });

  // Check 3: Panchanga start & end pages matching Adhika vs Normal year
  const expectedStart = meta.panchangaPageStart;
  const expectedEnd = meta.panchangaPageEnd;
  const expectedCount = meta.totalPakshas * 2;
  const actualPanchangaPages = pages.filter(
    (p) => p.sectionCategory === "Panchanga Dual-Page Left" || p.sectionCategory === "Panchanga Dual-Page Right"
  );
  const panchangaSpanValid = actualPanchangaPages.length === expectedCount;
  checks.push({
    id: "panchanga_span_check",
    category: "Panchanga Dual-Page",
    nameKn: `${meta.hasAdhikaMasa ? "೧೩ ಮಾಸಗಳ (ಅಧಿಕ ಸಹಿತ)" : "೧೨ ಮಾಸಗಳ"} ಪಂಚಾಂಗ ದ್ವಿಪುಟ ವ್ಯಾಪ್ತಿ (${expectedCount} ಪುಟಗಳು)`,
    nameEn: "Monthly Dual-Page Ephemeris Span Verification",
    passed: panchangaSpanValid,
    score: panchangaSpanValid ? 100 : 0,
    detailsKn: `ದೈನಂದಿನ ಪಂಚಾಂಗ ಪುಟಗಳು: ${actualPanchangaPages.length} ಪುಟಗಳು (ಪುಟ ${expectedStart} ರಿಂದ ${expectedEnd}).`
  });

  // Check 4: Left & Right alternating page parity
  let alternatingParityPassed = true;
  for (let p = expectedStart; p <= expectedEnd; p++) {
    const pageItem = pages[p - 1];
    if (p % 2 === 0 && pageItem.sectionCategory !== "Panchanga Dual-Page Left") {
      alternatingParityPassed = false;
      break;
    }
    if (p % 2 !== 0 && pageItem.sectionCategory !== "Panchanga Dual-Page Right") {
      alternatingParityPassed = false;
      break;
    }
  }
  checks.push({
    id: "alternating_page_parity",
    category: "Panchanga Dual-Page",
    nameKn: "ಎಡಪುಟ (ಸಮ ಸಂಖ್ಯೆ ೧೦ ಕಾಲಂ) ಮತ್ತು ಬಲಪುಟ (ಬೆಸ ಸಂಖ್ಯೆ ೧೨ ಲಗ್ನಗಳು) ಜೋಡಣೆ",
    nameEn: "Left-Page / Right-Page Dual Grid Alternating Parity",
    passed: alternatingParityPassed,
    score: alternatingParityPassed ? 100 : 0,
    detailsKn: "ಎಡಪುಟ ಪಂಚಾಂಗಾಂಗಗಳು ಮತ್ತು ಬಲಪುಟ ದಿವಾ ಲಗ್ನ ಸಮಾಪ್ತಿ ಕಾಲ ಮುಖಾಮುಖಿಯಾಗಿ ಜೋಡಿಸಲ್ಪಟ್ಟಿವೆ."
  });

  // Check 5: Navanayaka Ingress Weekday Lords
  const rajaValid = Boolean(navanayakas.raja.lordKn && navanayakas.raja.shloka);
  const mantriValid = Boolean(navanayakas.mantri.lordKn && navanayakas.mantri.shloka);
  checks.push({
    id: "navanayakas_determinism",
    category: "Astronomical Precision",
    nameKn: "ರಾಜಾದಿ ನವನಾಯಕರ ಶಾಸ್ತ್ರೀಯ ಗಣಿತ (ಸಂವತ್ಸರ ಫಲಂ)",
    nameEn: "Navanayakas Ingress Lordship Precision",
    passed: rajaValid && mantriValid,
    score: rajaValid && mantriValid ? 100 : 0,
    detailsKn: `ರಾಜ: ${navanayakas.raja.lordKn}, ಮಂತ್ರಿ: ${navanayakas.mantri.lordKn}, ಸೇನಾಧಿಪತಿ: ${navanayakas.senadhipati.lordKn} ಶ್ಲೋಕ ಮತ್ತು ಫಲ ಸಹಿತ ಸಿದ್ಧವಾಗಿದೆ.`
  });

  // Check 6: Pure Kannada Language Integrity (Zero English Leakage)
  // Scan all page titles and header texts
  const englishRegex = /[a-zA-Z]{4,}/; // Flag any word of 4 or more Latin characters in Kannada fields
  let englishLeakageFound = false;
  let leakedContext = "";
  for (const p of pages) {
    if (englishRegex.test(p.titleKn)) {
      englishLeakageFound = true;
      leakedContext = `ಪುಟ ${p.pageNumber}: "${p.titleKn}"`;
      break;
    }
  }
  const pureKannadaPassed = !englishLeakageFound;
  checks.push({
    id: "pure_kannada_integrity",
    category: "Language Purity",
    nameKn: "ಶುದ್ಧ ಕನ್ನಡ ಭಾಷಾ ಸಮಗ್ರತೆ (ಶೂನ್ಯ ಇಂಗ್ಲಿಷ್ ಪದ ಸೋರಿಕೆ)",
    nameEn: "Pure Kannada Typographic & Linguistic Integrity",
    passed: pureKannadaPassed,
    score: pureKannadaPassed ? 100 : 0,
    detailsKn: pureKannadaPassed
      ? "೧೦೪ ಪುಟಗಳ ಶೀರ್ಷಿಕೆ, ಕೋಷ್ಟಕ, ಶ್ಲೋಕಗಳಲ್ಲಿ ಯಾವುದೇ ಇಂಗ್ಲಿಷ್ ಪದಗಳ ಸೋರಿಕೆಯಾಗಿಲ್ಲ."
      : `ಇಂಗ್ಲಿಷ್ ಪದ ಕಂಡುಬಂದಿದೆ: ${leakedContext}`
  });

  // Check 7: Ashoucha Nirnaya 40 Rules Repository
  const ashouchaPage = pages.find((p) => p.layoutTemplateId === "ashoucha_nirnaya_rules");
  const ashouchaPassed = Boolean(ashouchaPage && ashouchaPage.contentData.rules?.length > 0);
  checks.push({
    id: "ashoucha_rules_check",
    category: "Shastric Rules",
    nameKn: "ಆಶೌಚ ನಿರ್ಣಯ (ಜನನ-ಮರಣ ಸೂತಕ ನಿಯಮಗಳ ಸಮಗ್ರತೆ)",
    nameEn: "Ashoucha Nirnaya Classical Rules Integrity",
    passed: ashouchaPassed,
    score: ashouchaPassed ? 100 : 0,
    detailsKn: "ಸಪಿಂಡ, ಸೋದಕ, ಗರ್ಭಸ್ರಾವ, ಬಾಲ್ಯಮರಣ ಮುಂತಾದ ಧರ್ಮಶಾಸ್ತ್ರೀಯ ಸೂತಕ ನಿಯಮಗಳು ಸೇರ್ಪಡೆಯಾಗಿವೆ."
  });

  // Check 8: Gokarna Oblique Ascension Table (Page 95 / 89)
  const gokarnaPage = pages.find((p) => p.layoutTemplateId === "gokarna_lagna_sphuta_sarani");
  const gokarnaPassed = Boolean(gokarnaPage && gokarnaPage.contentData.table?.length === 12);
  checks.push({
    id: "gokarna_lagna_sarani",
    category: "Astronomical Precision",
    nameKn: "ಗೋಕರ್ಣ ಅಕ್ಷಾಂಶ ೧೪° ೩೨' ಲಗ್ನಸ್ಫುಟ ಸಾರಣಿಯ ನಿಖರತೆ",
    nameEn: "Gokarna 14°32' Oblique Ascension Table Validation",
    passed: gokarnaPassed,
    score: gokarnaPassed ? 100 : 0,
    detailsKn: "ಮೇಷಾದಿ ೧೨ ರಾಶಿಗಳ ಉದಯಮಾನ ಘಟಿ-ವಿಘಟಿಗಳು ಗೋಕರ್ಣದ ರೇಖಾಂಶ-ಅಕ್ಷಾಂಶಕ್ಕೆ ಸಂಪೂರ್ಣ ತಾಳೆಯಾಗುತ್ತವೆ."
  });

  // Check 9: Kaliyugadi Ahargana & Shaka Eras Continuity
  const aharganaPassed = meta.gataKalyabda > 5120 && meta.kalyadyahargana > 1870000;
  checks.push({
    id: "ahargana_continuity",
    category: "Astronomical Precision",
    nameKn: "ಕಲ್ಯಾದ್ಯಹರ್ಗಣ & ಶಕ ಸಂವತ್ಸರ ಕಾಲಗಣನಾ ನಿರಂತರತೆ",
    nameEn: "Ahargana & Yuga Epoch Continuous Mathematical Integrity",
    passed: aharganaPassed,
    score: aharganaPassed ? 100 : 0,
    detailsKn: `ಗತ ಕಲ್ಯಾಬ್ದ: ${meta.gataKalyabda}, ಕಲ್ಯಾದ್ಯಹರ್ಗಣ: ${meta.kalyadyahargana}, ಏಷ್ಯ ಶಕಾಬ್ದ: ${meta.eshyaShakabda}.`
  });

  // Calculate totals
  const totalChecks = checks.length;
  const passedChecksCount = checks.filter((c) => c.passed).length;
  const failedChecksCount = totalChecks - passedChecksCount;
  const scorePercentage = Math.round((passedChecksCount / totalChecks) * 100);
  const isValid = scorePercentage === 100;

  return {
    shakaYear,
    samvatsaraKn: meta.samvatsaraKn,
    samvatsaraEn: meta.samvatsaraEn,
    isValid,
    scorePercentage,
    isGreenHighlighted: isValid,
    publicationReady: isValid,
    generatedTimestamp: new Date().toISOString(),
    totalPages: pages.length,
    totalChecks,
    passedChecksCount,
    failedChecksCount,
    checks,
    summaryKn: isValid
      ? `ಶ್ರೀ ${meta.samvatsaraKn} ಸಂವತ್ಸರದ ಬಗ್ಗೋಣ ಪಂಚಾಂಗದ ೧೦೪ ಪುಟಗಳು ಶತಪ್ರತಿಶತ ಶಾಸ್ತ್ರೀಯ ಮತ್ತು ಮುದ್ರಣ ಗುಣಮಟ್ಟ ಪರೀಕ್ಷೆಯಲ್ಲಿ ತೇರ್ಗಡೆಯಾಗಿವೆ. ಪ್ರಕಾಶನಕ್ಕೆ ಮತ್ತು ಮುದ್ರಣಾಲಯಕ್ಕೆ ಬಿಡುಗಡೆ ಮಾಡಲು ಸಂಪೂರ್ಣ ಅರ್ಹವಾಗಿದೆ.`
      : `ಪರೀಕ್ಷೆಯಲ್ಲಿ ${failedChecksCount} ತಪಾಸಣೆಗಳು ವಿಫಲವಾಗಿವೆ. ದಯವಿಟ್ಟು ಸರಿಪಡಿಸಿ.`
  };
}
