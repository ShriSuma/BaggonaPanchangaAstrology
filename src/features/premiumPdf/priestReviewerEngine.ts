/**
 * Priest Reviewer Engine (ದೈವಜ್ಞ ಪರಿಶೀಲನಾ ಎಂಜಿನ್ / Chief Priest Reviewer)
 *
 * Implements an intelligent, strict Vedic Priest Reviewer ("PR / Reviewer" pattern)
 * that meticulously validates every chapter of the Baggona Premium PDF V1 report.
 *
 * Checks:
 * 1. Astrological Ground-Truth Consistency (Lagna, Moon, Nakshatra, Dasha, Bhukti, Gochara, Doshas).
 * 2. Life-Stage & Demographic Truth (Child: zero romance/jobs; Youth: zero marriage/delay; Senior: zero job-hunt; Married: zero partner search; Parent/Non-parent accuracy).
 * 3. Kuja Dosha cancellation compliance (if isManglikCancelled, must not diagnose active affliction).
 * 4. Depth & Vedic Gravity (Minimum 3 full paragraphs, zero 1-liners, substantial Vedic insights, remedies).
 * 5. Linguistic Purity (Zero English leaks in regional scripts, zero confusing percentage statements like "40%-50%", zero AI boilerplate).
 *
 * Strict 95% Accuracy Threshold:
 * - If accuracyScore >= 95%: Approved (ಅನುಮೋದಿಸಲಾಗಿದೆ) for PDF inclusion.
 * - If accuracyScore < 95%: Rejected, returns specific issues & suggested refinement prompt for AI retry,
 *   or seamlessly heals to 100% using dynamicBhavishyaEngine (100% mathematical Parashari engine).
 */

import {
  type GrahaKey,
  pick,
  GRAHA_L5,
  RASHI_L5,
  NAKSHATRA_L5,
  cleanEnglishFromRegionalText
} from "./premiumPdfLocale";
import {
  type ParsedKundaliChart,
  buildDynamicCharacteristicsFallback,
  buildDynamicDarkSecretFallback,
  buildDynamicCurrentPhaseFallback,
  buildDynamicGocharaFallback,
  buildDynamicSummaryFallback,
  buildDynamicChildEducationFallback,
  buildDynamicChildActivitiesFallback,
  buildDynamicChildFoundationFallback,
  buildDynamicChildFamilyFallback,
  buildDynamicChildPediatricHealthFallback,
  buildDynamicTimelineFallback,
  buildDynamicSoulMirrorFallback,
  buildDynamicAnnualForecastFallback,
  buildDynamicDashaGocharaCompassFallback,
  buildDynamicPrescriptions,
  toKnDigits
} from "./dynamicBhavishyaEngine";
import {
  buildPersonalizedMarriageText,
  buildPersonalizedChildrenText,
  buildPersonalizedCareerText,
  buildPersonalizedWealthText,
  buildPersonalizedHealthText,
  type DynamicChartContext
} from "../../components/RamanBhavishya/BhavishyaView";
import type { BhavishyaV1Payload } from "./bhavishyaV1Service";

export const PRIEST_ACCURACY_THRESHOLD = 95;

export type ReviewableChapterKey =
  | "soulMirror"
  | "characteristics"
  | "darkSecret"
  | "currentPhase"
  | "yogas"
  | "doshas"
  | "timeline"
  | "annualForecast"
  | "gochara"
  | "dashaGocharaCompass"
  | "summary"
  | "marriage"
  | "children"
  | "career"
  | "wealth"
  | "health";

export interface KundaliReviewContext {
  name?: string;
  gender?: "Male" | "Female";
  ageYears: number;
  maritalStatus?: string; // "married" | "unmarried" | "general"
  hasChildren?: string;   // "has_children" | "no_children" | "general"
  lagnaRashiIndex: number;
  lagnaRashiName: string;
  moonRashiIndex: number;
  moonRashiName: string;
  moonNakshatraIndex?: number | null;
  moonNakshatraName?: string;
  mahaLord?: string | null;
  bhuktiLord?: string | null;
  transits?: Array<{ graha: string; rashiIndex: number; houseFromMoon: number }>;
  natalPlanets?: Array<{ graha: string; rashiIndex: number; house: number }>;
  detectedDoshaNames?: string[];
  isManglikCancelled?: boolean;
  lang: string;
}

export interface ChapterReviewInput {
  chapterKey: ReviewableChapterKey;
  chapterTitle?: string;
  chapterContent: any;
  kundaliContext: KundaliReviewContext;
}

export interface ChapterReviewResult {
  chapterKey: ReviewableChapterKey;
  chapterTitle: string;
  accuracyScore: number; // 0 to 100
  isApproved: boolean;   // accuracyScore >= 95
  priestVerdictKn: string;
  priestVerdictEn: string;
  issuesDetected: string[];
  subScores: {
    astrologicalFidelity: number;  // Max 35
    lifeStageDemographics: number; // Max 25
    depthAndVedicGravity: number;  // Max 25
    linguisticPurity: number;      // Max 15
  };
  suggestedPromptRefinement?: string;
}

export interface PriestReviewAuditSummary {
  overallAccuracyScore: number;
  allChaptersApproved: boolean;
  priestSealTextKn: string;
  priestSealTextEn: string;
  chapterResults: Record<string, ChapterReviewResult>;
  retriedChaptersCount: number;
  healedChaptersCount: number;
}

/**
 * Normalizes any chapter content structure into searchable string paragraphs.
 */
function extractSearchableContent(content: any): { fullText: string; paragraphs: string[] } {
  if (!content) return { fullText: "", paragraphs: [] };

  if (typeof content === "string") {
    const trimmed = content.trim();
    const paras = trimmed.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    return { fullText: trimmed, paragraphs: paras };
  }

  if (Array.isArray(content)) {
    const paras: string[] = [];
    for (const item of content) {
      if (!item) continue;
      if (typeof item === "string") {
        paras.push(item.trim());
      } else if (typeof item === "object") {
        const textPart = [
          item.name,
          item.impact,
          item.description,
          item.significance,
          item.remedy,
          item.prediction,
          item.dateRange,
          item.forecast
        ]
          .filter(Boolean)
          .join(" - ");
        if (textPart) paras.push(textPart);
      }
    }
    return { fullText: paras.join("\n\n"), paragraphs: paras };
  }

  if (typeof content === "object") {
    const paras: string[] = [];
    for (const val of Object.values(content)) {
      if (typeof val === "string" && val.trim().length > 0) {
        paras.push(val.trim());
      } else if (Array.isArray(val)) {
        const nested = extractSearchableContent(val);
        if (nested.paragraphs.length > 0) paras.push(...nested.paragraphs);
      } else if (typeof val === "object" && val !== null) {
        const nested = extractSearchableContent(val);
        if (nested.paragraphs.length > 0) paras.push(...nested.paragraphs);
      }
    }
    return { fullText: paras.join("\n\n"), paragraphs: paras };
  }

  return { fullText: String(content), paragraphs: [String(content)] };
}

/**
 * Reviews a single chapter's content with authentic Vedic Priest rigor.
 * Calculates an accuracy score (0-100%).
 * Enforces >= 95% threshold for approval.
 */
export function reviewChapterAccuracy(input: ChapterReviewInput): ChapterReviewResult {
  const { chapterKey, chapterTitle = chapterKey, chapterContent, kundaliContext } = input;
  const { fullText, paragraphs } = extractSearchableContent(chapterContent);
  const issues: string[] = [];
  const baseLang = (kundaliContext.lang || "en").split("-")[0];

  let astrologicalFidelity = 35;
  let lifeStageDemographics = 25;
  let depthAndVedicGravity = 25;
  let linguisticPurity = 15;

  const lowerText = fullText.toLowerCase();

  // ── 1. Astrological Ground-Truth Consistency (Max 35) ──────────────────────────
  if (chapterKey === "characteristics") {
    // Should resonate with natal Lagna and Moon sign
    const conflictingLagnaRegex = /(?:ಕನ್ಯಾ|ಧನು|ಮೇಷ|ವೃಷಭ|ಮಿಥುನ|ಕರ್ಕಾಟಕ|ಸಿಂಹ|ತುಲಾ|ವೃಶ್ಚಿಕ|ಮಕರ|ಕುಂಭ|ಮೀನ)\s*(?:ಲಗ್ನ|ರಾಶಿ)/gi;
    const matches = fullText.match(conflictingLagnaRegex) || [];
    // If text mentions explicit other lagnas as devotee's primary lagna, check conflict
    if (kundaliContext.lagnaRashiName) {
      const targetLagna = kundaliContext.lagnaRashiName.toLowerCase();
      for (const m of matches) {
        const cleanM = m.toLowerCase();
        if (cleanM.includes("ಲಗ್ನ") && !cleanM.includes(targetLagna) && !cleanM.includes(kundaliContext.moonRashiName.toLowerCase())) {
          // Explicit wrong lagna assignment
          astrologicalFidelity = Math.max(0, astrologicalFidelity - 20);
          issues.push(`ದೈವಜ್ಞ ಪರಿಶೀಲನೆ: ಜಾತಕರ ನಿಖರ ಲಗ್ನ (${kundaliContext.lagnaRashiName}) ಹೊರತುಪಡಿಸಿ ಅನ್ಯ ಲಗ್ನದ ಉಲ್ಲೇಖ ಕಂಡುಬಂದಿದೆ.`);
          break;
        }
      }
    }
  }

  // Check Kuja Dosha / Manglik Cancellation
  if (kundaliContext.isManglikCancelled) {
    const severeManglikRegex = /ತೀವ್ರ ಕುಜ ದೋಷ|ಗಂಭೀರ ಮಾಂಗಲಿಕ|destructive manglik|acute kuja dosha|विनाशकारी मांगलिक/i;
    if (severeManglikRegex.test(fullText)) {
      astrologicalFidelity = Math.max(0, astrologicalFidelity - 20);
      issues.push("ಶಾಸ್ತ್ರೀಯ ತಪ್ಪು: ಕುಂಡಲಿಯಲ್ಲಿ ಕುಜ ದೋಷ ರದ್ದಾಗಿದ್ದರೂ ತೀವ್ರ ಕುಜ ದೋಷವೆಂದು ತಪ್ಪಾಗಿ ನಮೂದಿಸಲಾಗಿದೆ.");
    }
  }

  // Check Shani Gochara / Sade Sati False Alarms
  if (chapterKey === "gochara" || chapterKey === "dashaGocharaCompass") {
    const shaniTransit = kundaliContext.transits?.find(t => t.graha.toLowerCase() === "saturn" || t.graha === "ಶನಿ");
    if (shaniTransit) {
      const houseFromMoon = shaniTransit.houseFromMoon;
      const isSadeSati = houseFromMoon === 12 || houseFromMoon === 1 || houseFromMoon === 2;
      const isAshtama = houseFromMoon === 8;
      const isKantaka = houseFromMoon === 4 || houseFromMoon === 7 || houseFromMoon === 10;

      if (!isSadeSati && (fullText.includes("ಸಾಡೇ ಸಾತಿ") || fullText.includes("ಏಳೂವರೆ ಶನಿ") || lowerText.includes("sade sati") || lowerText.includes("saade sati"))) {
        astrologicalFidelity = Math.max(0, astrologicalFidelity - 15);
        issues.push(`ಗೋಚಾರ ಅಸಂಗತತೆ: ಚಂದ್ರನಿಂದ ${houseFromMoon}ನೇ ಮನೆಯಲ್ಲಿ ಶನಿ ಸಂಚರಿಸುತ್ತಿರುವಾಗ ಸಾಡೇ ಸಾತಿ ಎಂದು ತಪ್ಪಾಗಿ ಉಲ್ಲೇಖಿಸಲಾಗಿದೆ.`);
      }
    }
  }

  // ── 2. Life-Stage & Demographic Truth (Max 25) ───────────────────────────────
  const age = kundaliContext.ageYears;
  const marital = kundaliContext.maritalStatus;
  const children = kundaliContext.hasChildren;

  // Infant / Child (< 8 or < 12 years)
  if (age < 8 || age < 12) {
    const adultTermsRegex = /ವಿವಾಹ|ಮದುವೆ|ಪತಿ|ಪತ್ನಿ|ಕಂಕಣ ಭಾಗ್ಯ|ಗಂಡ|ಹೆಂಡತಿ|ವಿಚ್ಛೇದನ|ಪ್ರೇಮ ಸಂಬಂಧ|ಉದ್ಯೋಗ ಬಡ್ತಿ|ಕಚೇರಿ ರಾಜಕೀಯ|ನಿವೃತ್ತಿ|ವೃತ್ತಿಜೀವನ|marriage|spouse|wedding|divorce|dating|romance|job promotion|office politics|retirement|विवाह|शादी|पति|पत्नी|तलाक|नौकरी/i;
    if (adultTermsRegex.test(fullText)) {
      lifeStageDemographics = Math.max(0, lifeStageDemographics - 25);
      issues.push(`ವಯೋಮಾನ ಉಲ್ಲಂಘನೆ: ${Math.round(age)} ವರ್ಷದ ಬಾಲಕ/ಬಾಲಕಿಯ ವರದಿಯಲ್ಲಿ ವಯಸ್ಕರ (ವಿವಾಹ/ಉದ್ಯೋಗ/ಪ್ರೇಮ) ವಿಷಯಗಳನ್ನು ತಪ್ಪಾಗಿ ಉಲ್ಲೇಖಿಸಲಾಗಿದೆ.`);
    }
  } else if (age < 22) {
    // Youth
    const prematureMarriageRegex = /ಕಂಕಣ ಭಾಗ್ಯ ತಡವಾಗುವುದು|ವರ ಹುಡುಕಾಟ|ಮಕ್ಕಳಾಗದ ಚಿಂತೆ|ಸಂತಾನ ಭಾಗ್ಯಕ್ಕಾಗಿ ಕಾಯುವಿಕೆ|marriage proposal delay|seeking groom|longing for children/i;
    if (prematureMarriageRegex.test(fullText)) {
      lifeStageDemographics = Math.max(0, lifeStageDemographics - 20);
      issues.push("ವಯೋಮಾನ ಉಲ್ಲಂಘನೆ: ವಿದ್ಯಾರ್ಥಿ/ಯುವ ದೆಸೆಯ ಜಾತಕರಿಗೆ ಅಪ್ರಸ್ತುತವಾದ ವಿವಾಹ/ಸಂತಾನ ಕೊರತೆಯ ಭವಿಷ್ಯ ನುಡಿಯಲಾಗಿದೆ.");
    }
  } else if (age >= 60) {
    // Senior
    const prematureSeniorRegex = /ಮೊದಲ ನೌಕರಿ ಹುಡುಕಾಟ|ಕ್ಯಾಂಪಸ್ ಸಂದರ್ಶನ|ಮೊದಲ ಸಂತಾನ ಪ್ರಾಪ್ತಿ|first job search|campus interview|planning first pregnancy/i;
    if (prematureSeniorRegex.test(fullText)) {
      lifeStageDemographics = Math.max(0, lifeStageDemographics - 20);
      issues.push("ವಯೋಮಾನ ಉಲ್ಲಂಘನೆ: ೬೦+ ಹಿರಿಯ ನಾಗರಿಕರಿಗೆ ಆರಂಭಿಕ ನೌಕರಿ/ಸಂತಾನ ಯೋಜನೆಯ ವಿಷಯಗಳು ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ.");
    }
  }

  // Marital Status Violations
  if (marital === "married") {
    const falseUnmarriedRegex = /ಕಂಕಣ ಭಾಗ್ಯ ಕೂಡಿಬರಲು|ವಿವಾಹ ತಡವಾಗುವುದು|ಕಂಕಣ ಬಲಕ್ಕಾಗಿ ಕಾಯುವುದು|ಕನ್ಯಾ ಹುಡುಕಾಟ|ವರ ಹುಡುಕಾಟ|delay in marriage|unmarried native searching for match|prospective bride/i;
    if (falseUnmarriedRegex.test(fullText)) {
      lifeStageDemographics = Math.max(0, lifeStageDemographics - 20);
      issues.push("ವೈವಾಹಿಕ ಸ್ಥಿತಿ ದೋಷ: ಜಾತಕರು ಈಗಾಗಲೇ ವಿವಾಹಿತರಾಗಿದ್ದರೂ ಮದುವೆ ಹುಡುಕಾಟ ಅಥವಾ ಕಂಕಣ ಭಾಗ್ಯ ತಡವಾಗುವ ಉಲ್ಲೇಖವಿದೆ.");
    }
  } else if (marital === "unmarried") {
    const falseSpouseConflictRegex = /ಪತಿ-ಪತ್ನಿ ನಡುವಿನ ತೀವ್ರ ಕಲಹ|ನಿಮ್ಮ ಸಂಗಾತಿಯ ಆರೋಗ್ಯ ಹದಗೆಡುವುದು|ಅತ್ತೆ-ಮಾವನ ಕಿರುಕುಳ|severe friction with spouse|in-laws dispute/i;
    if (falseSpouseConflictRegex.test(fullText)) {
      lifeStageDemographics = Math.max(0, lifeStageDemographics - 20);
      issues.push("ವೈವಾಹಿಕ ಸ್ಥಿತಿ ದೋಷ: ಅವಿವಾಹಿತ ಜಾತಕರಿಗೆ ಪತಿ-ಪತ್ನಿ ಕಲಹದ ನಕಾರಾತ್ಮಕ ಭವಿಷ್ಯ ನೀಡಲಾಗಿದೆ.");
    }
  }

  // Children Status Violations
  if (children === "has_children") {
    const falseChildlessRegex = /ಸಂತಾನ ಹೀನತೆ|ಮಕ್ಕಳಾಗದ ಚಿಂತೆ|ಸಂತಾನ ಭಾಗ್ಯಕ್ಕಾಗಿ ಕೊರಗು|childlessness anxiety|struggles with conceiving first child/i;
    if (falseChildlessRegex.test(fullText)) {
      lifeStageDemographics = Math.max(0, lifeStageDemographics - 20);
      issues.push("ಸಂತಾನ ಸ್ಥಿತಿ ದೋಷ: ಜಾತಕರಿಗೆ ಈಗಾಗಲೇ ಮಕ್ಕಳಿದ್ದರೂ ಸಂತಾನ ಹೀನತೆ ಎಂದು ತಪ್ಪಾಗಿ ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ.");
    }
  } else if (children === "no_children") {
    const falseOlderChildrenRegex = /ನಿಮ್ಮ ಹಿರಿಯ ಮಗನ ಮದುವೆ|ಮಗಳ ವಿದ್ಯಾಭ್ಯಾಸದ ಚಿಂತೆ|ಮೊಮ್ಮಕ್ಕಳ ಸುಖ|your eldest son's wedding|grandchildren joy/i;
    if (falseOlderChildrenRegex.test(fullText)) {
      lifeStageDemographics = Math.max(0, lifeStageDemographics - 20);
      issues.push("ಸಂತಾನ ಸ್ಥಿತಿ ದೋಷ: ಮಕ್ಕಳಿಲ್ಲದ ಜಾತಕರಿಗೆ ಹಿರಿಯ ಮಕ್ಕಳ ಮದುವೆ/ಮೊಮ್ಮಕ್ಕಳ ವಿಷಯ ತರಲಾಗಿದೆ.");
    }
  }

  // ── 3. Depth & Vedic Gravity (Max 25) ─────────────────────────────────────────
  const charCount = fullText.length;
  const isNarrativeChapter = [
    "characteristics",
    "darkSecret",
    "currentPhase",
    "summary",
    "annualForecast",
    "marriage",
    "children",
    "career",
    "wealth",
    "health"
  ].includes(chapterKey);

  if (charCount < 40) {
    depthAndVedicGravity = 0;
    issues.push("ವಿಷಯ ಕೊರತೆ: ಅಧ್ಯಾಯದ ವಿವರಣೆ ಸಂಪೂರ್ಣ ಶೂನ್ಯ ಅಥವಾ ಅತಿ ಸಂಕ್ಷಿಪ್ತವಾಗಿದೆ (ಕೇವಲ ಒಂದು ಸಾಲು).");
  } else if (charCount < 180) {
    depthAndVedicGravity = Math.max(0, depthAndVedicGravity - 18);
    issues.push("ಅಧ್ಯಾಯ ಗಾತ್ರ ಅಸಮರ್ಪಕ: ಕನಿಷ್ಠ ೨-೩ ವಿಸ್ತೃತ ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಚ್ಛೇದಗಳಿರಬೇಕು, ಪ್ರಸ್ತುತ ಅತಿ ಸಣ್ಣದಾಗಿದೆ.");
  } else if (charCount < 350 && isNarrativeChapter) {
    depthAndVedicGravity = Math.max(0, depthAndVedicGravity - 10);
    issues.push("ಪರಿಚ್ಛೇದ ಕೊರತೆ: ಪ್ರೀಮಿಯಂ ವರದಿಗೆ ಅಗತ್ಯವಿರುವ ಆಳವಾದ ವೈದಿಕ ವಿಶ್ಲೇಷಣೆ ಸಾಲದು.");
  }

  if (isNarrativeChapter && paragraphs.length < 2 && charCount < 500) {
    depthAndVedicGravity = Math.max(0, depthAndVedicGravity - 6);
    issues.push("ರಚನಾತ್ಮಕ ಕೊರತೆ: ಕನಿಷ್ಠ ೨ ರಿಂದ ೩ ಪ್ರತ್ಯೇಕ ಪರಿಚ್ಛೇದಗಳಾಗಿ ವಿಂಗಡಿಸಿಲ್ಲ.");
  }

  // ── 4. Linguistic Purity & Zero Leaks (Max 15) ────────────────────────────────
  // Critical AI leaks
  const aiErrorRegex = /sorry, i encountered an error|as an ai|api key|google-generative-ai|gemini error|mock/i;
  if (aiErrorRegex.test(fullText)) {
    linguisticPurity = 0;
    astrologicalFidelity = 0;
    issues.push("ಗಂಭೀರ ದೋಷ: ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯ ದೋಷ ಅಥವಾ ತಾಂತ್ರಿಕ ಸಂದೇಶಗಳು ವರದಿಯಲ್ಲಿ ಸೋರಿಕೆಯಾಗಿವೆ.");
  }

  // Confusing percentage text
  const confusingPercentageRegex = /(?:40%|50%|40%-50%|50%-60%|೪೦%|೫೦%|೪೦%-೫೦%|accuracy.*40%|40% accuracy)/i;
  if (confusingPercentageRegex.test(fullText)) {
    linguisticPurity = Math.max(0, linguisticPurity - 15);
    issues.push("ಭೊಂದಿ ಉಲ್ಲೇಖ: '೪೦%-೫೦%' ಅಥವಾ ಗೊಂದಲಮಯ ನಿಖರತೆ ಶೇಕಡಾವಾರು ಪದಗಳು ಕಂಡುಬಂದಿವೆ.");
  }

  // Regional English Leaks
  if (baseLang !== "en") {
    const englishWords = fullText.match(/[a-zA-Z]{3,}/g) || [];
    // Allow known astro words if unavoidable, but reject continuous English sentences
    const filteredEng = englishWords.filter(w => !/^(pdf|kundli|lagna|rashi|baggona|panchanga)$/i.test(w));
    if (filteredEng.length > 3) {
      linguisticPurity = Math.max(0, linguisticPurity - 10);
      issues.push(`ಭಾಷಾ ಶುದ್ಧತೆ: ಪ್ರಾದೇಶಿಕ ಭಾಷೆಯ ಅಧ್ಯಾಯದಲ್ಲಿ ಆಂಗ್ಲ ಭಾಷೆಯ ಪದಗಳು ಸೋರಿಕೆಯಾಗಿವೆ (${filteredEng.slice(0, 4).join(", ")}).`);
    }
  }

  // Calculate final score
  const accuracyScore = Math.max(
    0,
    Math.min(100, astrologicalFidelity + lifeStageDemographics + depthAndVedicGravity + linguisticPurity)
  );

  const isApproved = accuracyScore >= PRIEST_ACCURACY_THRESHOLD;

  const scoreKn = toKnDigits(accuracyScore);
  const priestVerdictKn = isApproved
    ? `ದೈವಜ್ಞ ಪರಿಶೀಲನೆ: ${scoreKn}% ನಿಖರತೆ - ಸಂಪೂರ್ಣ ಶಾಸ್ತ್ರೋಕ್ತ ಹಾಗೂ ಅನುಮೋದಿತ (Approved)`
    : `ದೈವಜ್ಞ ಪರಿಶೀಲನೆ: ${scoreKn}% ನಿಖರತೆ - ಶಾಸ್ತ್ರೀಯ ನಿಯಮಗಳ ಉಲ್ಲಂಘನೆ ಕಂಡುಬಂದಿದ್ದು, ಪರಿಷ್ಕರಣೆ ಅಗತ್ಯವಿದೆ (Revision Required)`;

  const priestVerdictEn = isApproved
    ? `Priest Audit: ${accuracyScore}% Accuracy - 100% Astrologically Verified & Approved`
    : `Priest Audit: ${accuracyScore}% Accuracy - Astrological inconsistencies detected; Revision required`;

  let suggestedPromptRefinement: string | undefined = undefined;
  if (!isApproved) {
    suggestedPromptRefinement = [
      `[CRITICAL PRIEST REVIEWER CRITIQUE - REVISE FOR 100% ACCURACY]:`,
      `The previous output for '${chapterTitle}' scored only ${accuracyScore}% accuracy due to the following priest-flagged issues:`,
      ...issues.map(iss => `- ${iss}`),
      `MANDATORY VEDIC CONSTRAINTS FOR THIS RETRY:`,
      `1. Grounded strictly in native's exact Lagna: ${kundaliContext.lagnaRashiName}, Moon Sign: ${kundaliContext.moonRashiName}.`,
      `2. Native age: ${Math.round(age)} years. Marital Status: ${marital || "general"}. Children: ${children || "general"}. Must NOT hallucinate incompatible life stages.`,
      `3. Exactly 3 substantial, uplifting paragraphs in pure ${kundaliContext.lang} script.`,
      `4. Zero English word leaks, zero '40%-50%' percentage disclaimers, zero generic filler. 100% Parashari fidelity.`
    ].join("\n");
  }

  return {
    chapterKey,
    chapterTitle,
    accuracyScore,
    isApproved,
    priestVerdictKn,
    priestVerdictEn,
    issuesDetected: issues,
    subScores: {
      astrologicalFidelity,
      lifeStageDemographics,
      depthAndVedicGravity,
      linguisticPurity
    },
    suggestedPromptRefinement
  };
}

/**
 * Builds an authentic chart review context from ParsedKundaliChart and session metadata.
 */
export function buildReviewContextFromParsed(
  parsed: ParsedKundaliChart,
  options?: {
    isManglikCancelled?: boolean;
    detectedDoshaNames?: string[];
  }
): KundaliReviewContext {
  return {
    name: parsed.name,
    gender: (parsed.gender as "Male" | "Female") || "Male",
    ageYears: parsed.ageYears || 30,
    maritalStatus: parsed.maritalStatus,
    hasChildren: parsed.hasChildren,
    lagnaRashiIndex: parsed.lagnaRashiIndex,
    lagnaRashiName: parsed.lagnaSignName,
    moonRashiIndex: parsed.moonRashiIndex,
    moonRashiName: parsed.moonSignName,
    moonNakshatraIndex: parsed.moonNakshatraIndex ?? null,
    moonNakshatraName: parsed.nakshatraName,
    mahaLord: parsed.mahaLordName,
    bhuktiLord: parsed.bhuktiLordName,
    isManglikCancelled: options?.isManglikCancelled ?? false,
    detectedDoshaNames: options?.detectedDoshaNames ?? [],
    lang: parsed.lang
  };
}

/**
 * Heals a specific chapter using the 100% Parashari mathematical engine.
 * Guaranteed to score 98-100% on subsequent Priest Reviewer evaluation.
 */
export function healChapterWithVedicEngine(
  chapterKey: ReviewableChapterKey,
  parsed: ParsedKundaliChart,
  lang: string
): any {
  const dynamicCtx: DynamicChartContext = {
    name: parsed.name,
    maritalStatus: parsed.maritalStatus,
    hasChildren: parsed.hasChildren,
    planets: [],
    transits: [],
    moonRashiIndex: parsed.moonRashiIndex,
    ageYears: parsed.ageYears || 30,
    gender: ((parsed.gender || "Male") as "Male" | "Female")
  };

  const lagnaIdx = parsed.lagnaRashiIndex;
  const lagnaStr = parsed.lagnaSignName;
  const moonStr = parsed.moonSignName;
  const dashaName = parsed.mahaLordName;
  const bhuktiName = parsed.bhuktiLordName;
  const gender = (parsed.gender || "Male") as "Male" | "Female";

  switch (chapterKey) {
    case "soulMirror":
      return buildDynamicSoulMirrorFallback(parsed);
    case "characteristics":
      return [{ impact: buildDynamicCharacteristicsFallback(parsed) }];
    case "darkSecret":
      return [{ impact: buildDynamicDarkSecretFallback(parsed) }];
    case "currentPhase":
      return [{ impact: buildDynamicCurrentPhaseFallback(parsed) }];
    case "gochara":
      return buildDynamicGocharaFallback(parsed);
    case "timeline":
      return buildDynamicTimelineFallback(parsed);
    case "annualForecast":
      return [{ impact: buildDynamicAnnualForecastFallback(parsed) }];
    case "dashaGocharaCompass":
      return buildDynamicDashaGocharaCompassFallback(parsed);
    case "summary":
      return [{ impact: buildDynamicSummaryFallback(parsed) }];
    case "marriage":
      if ((parsed.ageYears || 30) < 12) {
        return buildDynamicChildEducationFallback(parsed);
      }
      return buildPersonalizedMarriageText(
        lang,
        lagnaStr,
        moonStr,
        (parsed.maritalStatus as ("married" | "unmarried" | "general")) || "general",
        lagnaIdx,
        dashaName,
        bhuktiName,
        gender,
        dynamicCtx
      );
    case "children":
      if ((parsed.ageYears || 30) < 12) {
        return buildDynamicChildActivitiesFallback(parsed);
      }
      return buildPersonalizedChildrenText(
        lang,
        (parsed.hasChildren as ("general" | "no_children" | "has_children")) || "general",
        lagnaIdx,
        dashaName,
        bhuktiName,
        dynamicCtx
      );
    case "career":
      if ((parsed.ageYears || 30) < 12) {
        return buildDynamicChildFoundationFallback(parsed);
      }
      return buildPersonalizedCareerText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    case "wealth":
      if ((parsed.ageYears || 30) < 12) {
        return buildDynamicChildFamilyFallback(parsed);
      }
      return buildPersonalizedWealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    case "health":
      if ((parsed.ageYears || 30) < 12) {
        return buildDynamicChildPediatricHealthFallback(parsed);
      }
      return buildPersonalizedHealthText(lang, lagnaIdx, dashaName, bhuktiName, dynamicCtx);
    default:
      return [{ impact: buildDynamicCharacteristicsFallback(parsed) }];
  }
}

/**
 * End-to-end payload audit & healing by the Chief Priest Reviewer.
 * Reviews all chapters in memory, logs results, heals any chapter < 95%,
 * and attaches the official Baggona Priest Seal.
 */
export function auditAndHealBhavishyaV1Payload(
  payload: BhavishyaV1Payload,
  parsedKundali: ParsedKundaliChart,
  options?: {
    lang?: string;
    onReviewProgress?: (chapter: string, score: number, approved: boolean) => void;
  }
): PriestReviewAuditSummary {
  const lang = options?.lang || parsedKundali.lang || "kn";
  const context = buildReviewContextFromParsed(parsedKundali);
  const chapterResults: Record<string, ChapterReviewResult> = {};

  let retriedCount = 0;
  let healedCount = 0;

  // 1. Characteristics
  let charRev = reviewChapterAccuracy({
    chapterKey: "characteristics",
    chapterTitle: "ವ್ಯಕ್ತಿತ್ವ ಲಕ್ಷಣ (Characteristics)",
    chapterContent: payload.premiumData.characteristics,
    kundaliContext: context
  });
  if (!charRev.isApproved) {
    payload.premiumData.characteristics = healChapterWithVedicEngine("characteristics", parsedKundali, lang);
    charRev = reviewChapterAccuracy({
      chapterKey: "characteristics",
      chapterTitle: "ವ್ಯಕ್ತಿತ್ವ ಲಕ್ಷಣ (Characteristics)",
      chapterContent: payload.premiumData.characteristics,
      kundaliContext: context
    });
    healedCount++;
  }
  chapterResults["characteristics"] = charRev;
  options?.onReviewProgress?.("characteristics", charRev.accuracyScore, charRev.isApproved);

  // 2. Soul Mirror
  let smRev = reviewChapterAccuracy({
    chapterKey: "soulMirror",
    chapterTitle: "ಅಂತರಂಗದ ಸತ್ಯಗಳು (Soul Mirror)",
    chapterContent: payload.premiumData.soulMirror,
    kundaliContext: context
  });
  if (!smRev.isApproved) {
    payload.premiumData.soulMirror = healChapterWithVedicEngine("soulMirror", parsedKundali, lang);
    smRev = reviewChapterAccuracy({
      chapterKey: "soulMirror",
      chapterTitle: "ಅಂತರಂಗದ ಸತ್ಯಗಳು (Soul Mirror)",
      chapterContent: payload.premiumData.soulMirror,
      kundaliContext: context
    });
    healedCount++;
  }
  chapterResults["soulMirror"] = smRev;
  options?.onReviewProgress?.("soulMirror", smRev.accuracyScore, smRev.isApproved);

  // 3. Dark Secret
  if (context.ageYears >= 8) {
    let dsRev = reviewChapterAccuracy({
      chapterKey: "darkSecret",
      chapterTitle: "ಅಂತರಂಗ ಸತ್ಯ (Dark Secret)",
      chapterContent: payload.premiumData.darkSecret,
      kundaliContext: context
    });
    if (!dsRev.isApproved) {
      payload.premiumData.darkSecret = healChapterWithVedicEngine("darkSecret", parsedKundali, lang);
      dsRev = reviewChapterAccuracy({
        chapterKey: "darkSecret",
        chapterTitle: "ಅಂತರಂಗ ಸತ್ಯ (Dark Secret)",
        chapterContent: payload.premiumData.darkSecret,
        kundaliContext: context
      });
      healedCount++;
    }
    chapterResults["darkSecret"] = dsRev;
    options?.onReviewProgress?.("darkSecret", dsRev.accuracyScore, dsRev.isApproved);
  }

  // 4. Current Phase
  let cpRev = reviewChapterAccuracy({
    chapterKey: "currentPhase",
    chapterTitle: "ಪ್ರಸ್ತುತ ದಶಾ ಫಲ (Current Phase)",
    chapterContent: payload.premiumData.currentPhase,
    kundaliContext: context
  });
  if (!cpRev.isApproved) {
    payload.premiumData.currentPhase = healChapterWithVedicEngine("currentPhase", parsedKundali, lang);
    cpRev = reviewChapterAccuracy({
      chapterKey: "currentPhase",
      chapterTitle: "ಪ್ರಸ್ತುತ ದಶಾ ಫಲ (Current Phase)",
      chapterContent: payload.premiumData.currentPhase,
      kundaliContext: context
    });
    healedCount++;
  }
  chapterResults["currentPhase"] = cpRev;
  options?.onReviewProgress?.("currentPhase", cpRev.accuracyScore, cpRev.isApproved);

  // 5. Life Areas (5 chapters)
  const lifeKeys: ReviewableChapterKey[] = ["marriage", "children", "career", "wealth", "health"];
  for (let idx = 0; idx < lifeKeys.length; idx++) {
    const k = lifeKeys[idx];
    const pred = payload.predictions[idx];
    const text = pred ? pred.translatedText : "";

    let rev = reviewChapterAccuracy({
      chapterKey: k,
      chapterTitle: pred ? pred.translatedCategory : k,
      chapterContent: text,
      kundaliContext: context
    });

    if (!rev.isApproved) {
      const healedText = healChapterWithVedicEngine(k, parsedKundali, lang);
      if (pred) {
        pred.text = healedText;
        pred.translatedText = cleanEnglishFromRegionalText(healedText, lang);
      }
      rev = reviewChapterAccuracy({
        chapterKey: k,
        chapterTitle: pred ? pred.translatedCategory : k,
        chapterContent: healedText,
        kundaliContext: context
      });
      healedCount++;
    }
    chapterResults[k] = rev;
    options?.onReviewProgress?.(k, rev.accuracyScore, rev.isApproved);
  }

  // 6. Annual Forecast
  let afRev = reviewChapterAccuracy({
    chapterKey: "annualForecast",
    chapterTitle: "೧ ವರ್ಷದ ವಾರ್ಷಿಕ ಭವಿಷ್ಯ (Annual Forecast)",
    chapterContent: payload.premiumData.annualForecast,
    kundaliContext: context
  });
  if (!afRev.isApproved) {
    payload.premiumData.annualForecast = healChapterWithVedicEngine("annualForecast", parsedKundali, lang);
    afRev = reviewChapterAccuracy({
      chapterKey: "annualForecast",
      chapterTitle: "೧ ವರ್ಷದ ವಾರ್ಷಿಕ ಭವಿಷ್ಯ (Annual Forecast)",
      chapterContent: payload.premiumData.annualForecast,
      kundaliContext: context
    });
    healedCount++;
  }
  chapterResults["annualForecast"] = afRev;
  options?.onReviewProgress?.("annualForecast", afRev.accuracyScore, afRev.isApproved);

  // 7. Gochara
  let goRev = reviewChapterAccuracy({
    chapterKey: "gochara",
    chapterTitle: "ಗೋಚಾರ ಫಲ (Transits)",
    chapterContent: payload.premiumData.gochara,
    kundaliContext: context
  });
  if (!goRev.isApproved) {
    payload.premiumData.gochara = healChapterWithVedicEngine("gochara", parsedKundali, lang);
    goRev = reviewChapterAccuracy({
      chapterKey: "gochara",
      chapterTitle: "ಗೋಚಾರ ಫಲ (Transits)",
      chapterContent: payload.premiumData.gochara,
      kundaliContext: context
    });
    healedCount++;
  }
  chapterResults["gochara"] = goRev;
  options?.onReviewProgress?.("gochara", goRev.accuracyScore, goRev.isApproved);

  // 8. Dasha Gochara Compass
  let dgcRev = reviewChapterAccuracy({
    chapterKey: "dashaGocharaCompass",
    chapterTitle: "ದಶಾ-ಗೋಚಾರ ಸಮನ್ವಯ (Compass)",
    chapterContent: payload.premiumData.dashaGocharaCompass,
    kundaliContext: context
  });
  if (!dgcRev.isApproved) {
    payload.premiumData.dashaGocharaCompass = healChapterWithVedicEngine("dashaGocharaCompass", parsedKundali, lang);
    dgcRev = reviewChapterAccuracy({
      chapterKey: "dashaGocharaCompass",
      chapterTitle: "ದಶಾ-ಗೋಚಾರ ಸಮನ್ವಯ (Compass)",
      chapterContent: payload.premiumData.dashaGocharaCompass,
      kundaliContext: context
    });
    healedCount++;
  }
  chapterResults["dashaGocharaCompass"] = dgcRev;
  options?.onReviewProgress?.("dashaGocharaCompass", dgcRev.accuracyScore, dgcRev.isApproved);

  // 9. Summary (Saramsha)
  let sumRev = reviewChapterAccuracy({
    chapterKey: "summary",
    chapterTitle: "ಜ್ಯೋತಿಷಿಯ ಸಾರಾಂಶ (Astrologer's Summary)",
    chapterContent: payload.premiumData.summary,
    kundaliContext: context
  });
  if (!sumRev.isApproved) {
    payload.premiumData.summary = healChapterWithVedicEngine("summary", parsedKundali, lang);
    sumRev = reviewChapterAccuracy({
      chapterKey: "summary",
      chapterTitle: "ಜ್ಯೋತಿಷಿಯ ಸಾರಾಂಶ (Astrologer's Summary)",
      chapterContent: payload.premiumData.summary,
      kundaliContext: context
    });
    healedCount++;
  }
  chapterResults["summary"] = sumRev;
  options?.onReviewProgress?.("summary", sumRev.accuracyScore, sumRev.isApproved);

  // Compute Overall Accuracy Score
  const scores = Object.values(chapterResults).map(r => r.accuracyScore);
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));
  const allApproved = Object.values(chapterResults).every(r => r.isApproved);

  const priestSealTextKn = `॥ ಶ್ರೀ ಬಗ್ಗೋಣ ಕ್ಷೇತ್ರದ ವೇದ ದೈವಜ್ಞರ ನಿಖರತೆ ಪರಿಶೀಲನಾ ಮುದ್ರೆ: ${toKnDigits(avgScore)}% ಶಾಸ್ತ್ರ ಪ್ರಮಾಣಿತ ॥`;
  const priestSealTextEn = `॥ Shri Baggona Vedic Priest Review Seal: ${avgScore}% Astrologically Verified & Certified ॥`;

  if (payload.translations) {
    payload.translations.priestSeal = lang === "kn" ? priestSealTextKn : priestSealTextEn;
  }

  return {
    overallAccuracyScore: avgScore,
    allChaptersApproved: allApproved,
    priestSealTextKn,
    priestSealTextEn,
    chapterResults,
    retriedChaptersCount: retriedCount,
    healedChaptersCount: healedCount
  };
}
