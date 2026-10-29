/**
 * instantReadingTalkingPointsEngine.ts
 *
 * Dedicated engine to construct, parse, and guarantee at least 10 structured,
 * color-coded bullet points for each of the First Six Instant Reading Sections:
 *   1. ಆರಂಭ & ಮೂಲ ಪ್ರಕೃತಿ (Ice-Breaker & Core Temperament)
 *   2. ಅಂತರಂಗದ ಗುಪ್ತ ಆತಂಕ & ಚಿಂತೆ (Hidden Subconscious Worry / Agony)
 *   3. 99% ಆದ ಕೆಲಸ ನಿಲ್ಲಿಸುವ 'ಮಾಂದಿ ಕರ್ಮ ಗಂಟು' (The 99% Last-Mile Knot & Maandi Karma)
 *   4. ಶಾರೀರಿಕ ಮಚ್ಚೆ ಗುರುತು & ತ್ರಿದೋಷ ಪ್ರಕೃತಿ (Physical Sign / Anga Lakshana & Tridosha)
 *   5. ಕರ್ಮ ಸ್ಥಾನ & ವಾಸ್ತವಿಕ ಆರ್ಥಿಕ ಸ್ಥಿತಿ (Karma & Financial Reality)
 *   6. ದಶಾ ತಿರುವು & ಶ್ರೀ ಗೋಕರ್ಣ ಸಿದ್ಧ ಪರಿಹಾರ (Turning Point & Sacred Gokarna Remedy)
 *
 * Color Coding Hierarchy (User Directive):
 *   - "good"   -> GREEN  (Auspicious traits, planetary protections, strengths, blessings)
 *   - "bad"    -> RED    (Doshas, afflictions, hurdles, stressors, negative tendencies)
 *   - "notice" -> YELLOW (Attention items, dasha sandhi, vigilance, turning point timing)
 *   - "normal" -> NORMAL (Neutral observations, factual Shastric basis, basic traits)
 *
 * Guaranteed Constraint: At least 10 distinct, non-empty bullet points per section.
 */

import type { PanchangaSynthesisOutput } from "./PanchangaAngaSynthesisEngine";
import {
  toKannadaRashi,
  toKannadaNakshatra,
  toKannadaPlanet,
  sanitizeAstrologyKannadaText
} from "../utils/kannadaAstrologyTerms";

export type PointTone = "good" | "bad" | "notice" | "normal";

export interface AstrologerPointItem {
  id: number;
  text: string;
  tone: PointTone;
  tagKn: string;
  tagEn: string;
}

export interface FirstSixTalkingPointsStructured {
  openingIceBreaker: AstrologerPointItem[];
  hiddenSubconsciousWorry: AstrologerPointItem[];
  maandiKarmicImpact: AstrologerPointItem[];
  bodyMarkAndTemperament: AstrologerPointItem[];
  karmaFinancialReality: AstrologerPointItem[];
  immediateTurningPoint: AstrologerPointItem[];
}

export function getToneLabel(tone: PointTone, isKn: boolean): string {
  switch (tone) {
    case "good":
      return isKn ? "ಶುಭ" : "Good / Strength";
    case "bad":
      return isKn ? "ಸವಾಲು" : "Challenge";
    case "notice":
      return isKn ? "ಗಮನಿಸಿ" : "Key Notice";
    case "normal":
    default:
      return isKn ? "ವಿವರಣೆ" : "Detail";
  }
}

/**
 * Classifies an astrology statement into tone based on authentic astrological vocabulary.
 */
export function classifyAstrologyTextTone(text: string): PointTone {
  const lower = text.toLowerCase();

  // Bad / Affliction / Challenge keywords (RED)
  const badPatterns = [
    "ದೋಷ", "ವಿಘ್ನ", "ಸವಾಲು", "ತಡೆ", "ಅಡೆತಡೆ", "ನಷ್ಟ", "ಸಂಕಷ್ಟ", "ಆತಂಕ", "ಚಿಂತೆ",
    "ಕ್ಲೇಶ", "ಭಾರ", "ನೋವು", "ಸಂಕೋಚ", "ಪ್ರತಿಕೂಲ", "ಸಮಸ್ಯೆ", "ವಿಳಂಬ", "ವಂಚನೆ",
    "ಕುಂದು", "ಅಪಾರ್ಥ", "ಸಂಕಟ", "ದೌರ್ಬಲ್ಯ", "ಆಲಸ್ಯ", "99%", "ಕೈತಪ್ಪುವ",
    "ಹಿಪ್ಪೆ", "ಗಂಟು", "stumble", "hurdle", "affliction", "delay", "loss", "anxiety",
    "stress", "misunderstanding", "stubborn", "knot", "clerical error", "fatigue"
  ];
  for (const bp of badPatterns) {
    if (lower.includes(bp)) return "bad";
  }

  // Notice / Vigilance / Turning Point keywords (YELLOW)
  const noticePatterns = [
    "ಗಮನಿಸಿ", "ಎಚ್ಚರಿಕೆ", "ತಿರುವು", "ಸಂಧಿ", "ಬದಲಾವಣೆ", "ಕಾಲಾವಧಿ", "ತಿಂಗಳು",
    "ವರ್ಷ", "ಸಮಯ", "ಮಹತ್ವದ", "ಜಾಗರೂಕತೆ", "ಸಂಕಲ್ಪ", "ನಿಯಮ", "ಗಮನಿಸಬೇಕಾದ", "ಅಗತ್ಯ",
    "ಸಿದ್ಧತೆ", "ಅವಶ್ಯಕ", "ಪ್ರಮುಖ ಕಾಲ", "notice", "alert", "turning point", "sandhi",
    "transition", "timeline", "months", "caution", "vigilance", "crucial", "milestone"
  ];
  for (const np of noticePatterns) {
    if (lower.includes(np)) return "notice";
  }

  // Good / Auspicious / Strength keywords (GREEN)
  const goodPatterns = [
    "ಶುಭ", "ವಿಜಯ", "ಲಾಭ", "ಯಶಸ್ಸು", "ಶ್ರೇಷ್ಠ", "ಬಲ", "ರಕ್ಷಣೆ", "ಉನ್ನತಿ", "ಸಾಮರ್ಥ್ಯ",
    "ಪ್ರಾಮಾಣಿಕ", "ಆಶೀರ್ವಾದ", "ಶಾಂತಿ", "ಪರಿಹಾರ", "ಮುಕ್ತಿ", "ಸಿದ್ಧ", "ದೈವ", "ಅನುಕೂಲ",
    "ಕೀರ್ತಿ", "ಗೌರವ", "ಸೌಭಾಗ್ಯ", "ಪ್ರಗತಿ", "ಉತ್ತಮ", "ಆರೋಗ್ಯ", "ಧೈರ್ಯ", "ಬೆಂಬಲ",
    "ಶ್ರೀರಕ್ಷೆ", "ಕೃಪೆ", "good", "auspicious", "strength", "blessing", "prosperity",
    "gain", "victory", "success", "protection", "flourish", "recuperate", "shield"
  ];
  for (const gp of goodPatterns) {
    if (lower.includes(gp)) return "good";
  }

  return "normal";
}

/**
 * Generates 12 crisp, shocking, technical-free personality bullet points
 * for Card 1 (Ice-Breaker & Core Temperament) based on the native's
 * astrological signature (Ascendant, Moon sign, Nakshatra, Gender).
 *
 * CRITICAL RULE: STRICTLY ZERO technical jargon (no "Lagna", "Rashi", "Graha",
 * "House", "Lord", "Nakshatra", "Ascendant", etc.).
 * Every bullet point describes a vivid, undeniable human personality trait,
 * behavioral habit, or psychological reality that makes the native nod in shock.
 */
export interface CoreTemperamentOptions {
  lagnaEn: string;
  moonEn: string;
  nakshatraEn: string;
  isFemale: boolean;
  isKn: boolean;
  devoteeName?: string;
}

export function buildCoreTemperamentPoints(options: CoreTemperamentOptions): AstrologerPointItem[] {
  const lagnaKey = (options.lagnaEn || "Aries").trim().toLowerCase();
  const nakKey = (options.nakshatraEn || "Ashwini").trim().toLowerCase();
  const isKn = options.isKn;

  // 12 Ascendant-specific core temperament portraits (Zero technical jargon!)
  const coreSignKn: Record<string, string> = {
    aries: "ಇವರು ಯಾರ ಬೆಂಬಲಕ್ಕೂ ಕಾಯದೆ ಸ್ವಂತ ಕಾಲಮೇಲೆ ನಿಲ್ಲುವ ಅದಮ್ಯ ಸ್ವಾಭಿಮಾನಿ; ಸ್ವಂತ ಪರಿಶ್ರಮ ಹಾಗೂ ಛಲದಿಂದಲೇ ಬದುಕಿನಲ್ಲಿ ಮುನ್ನುಗ್ಗುವ ನೈಸರ್ಗಿಕ ನಾಯಕತ್ವ ಇವರ ರಕ್ತದಲ್ಲೇ ಇದೆ.",
    taurus: "ಹೊರನೋಟಕ್ಕೆ ಅತ್ಯಂತ ಶಾಂತ ಹಾಗೂ ಸಮಾಧಾನಿಯಾಗಿ ಕಂಡರೂ, ಅಂತರಂಗದಲ್ಲಿ ಹಿಮಾಲಯದಂತಹ ಅಚಲ ದೃಢತೆ, ಗಾಂಭೀರ್ಯ ಹಾಗೂ ಸ್ವಾವಲಂಬನೆಯ ಅದಮ್ಯ ಸ್ವಾಭಿಮಾನ ಹೊಂದಿದ ವ್ಯಕ್ತಿತ್ವ.",
    gemini: "ಅತ್ಯಂತ ತೀಕ್ಷ್ಣ ಬುದ್ಧಿಶಕ್ತಿ, ಕ್ಷಿಪ್ರ ಗ್ರಹಣ ಸಾಮರ್ಥ್ಯ ಹಾಗೂ ಏಕಕಾಲದಲ್ಲಿ ಹಲವು ಜವಾಬ್ದಾರಿಗಳನ್ನು ನಿಭಾಯಿಸಬಲ್ಲ ಅದ್ಭುತ ಬುದ್ಧಿಚುರುಕು ಇವರ ಹುಟ್ಟುಗುಣ.",
    cancer: "ಹೊರಗಡೆ ಗಟ್ಟಿಯಾದ ಕವಚ ಧರಿಸಿದ್ದರೂ, ಅಂತರಂಗದಲ್ಲಿ ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮ ಸಂವೇದನೆ, ಅಪಾರ ಪ್ರೀತಿ-ಮಮತೆ ಹಾಗೂ ಕುಟುಂಬವನ್ನು ಪ್ರಾಣಕ್ಕಿಂತ ಹೆಚ್ಚಾಗಿ ರಕ್ಷಿಸುವ ಅಪ್ರತಿಮ ವ್ಯಕ್ತಿತ್ವ.",
    leo: "ಹುಟ್ಟಿನಿಂದಲೇ ಸಹಜ ರಾಜಗಾಂಭೀರ್ಯ, ಉನ್ನತ ಆತ್ಮಗೌರವ ಹಾಗೂ ಯಾರ ಮುಂದೆಯೂ ತಲೆತಗ್ಗಿಸದೆ ತಲೆಯೆತ್ತಿ ಬಾಳುವ ಅದಮ್ಯ ನಾಯಕತ್ವ ಇವರ ನೈಜ ಗುರುತು.",
    virgo: "ಅದ್ಭುತ ವಿಶ್ಲೇಷಣಾ ಶಕ್ತಿ, ಪ್ರಾಕ್ಟಿಕಲ್ ಬುದ್ಧಿಮತ್ತೆ ಹಾಗೂ ಕೈಗೆತ್ತಿಕೊಂಡ ಕೆಲಸದಲ್ಲಿ ಶೇಕಡಾ ನೂರರಷ್ಟು ಅಚ್ಚುಕಟ್ಟುತನವನ್ನು ಸಾಧಿಸುವ ಅಪ್ರತಿಮ ಶಿಸ್ತುಬದ್ಧ ವ್ಯಕ್ತಿತ್ವ.",
    libra: "ಸಭ್ಯ ನಡವಳಿಕೆ, ಶಾಂತಿಪ್ರಿಯತೆ ಹಾಗೂ ಸಮಾಜದಲ್ಲಿ ಎಲ್ಲರೊಂದಿಗೆ ಸಮತೋಲನ ಮತ್ತು ಘನತೆಯಿಂದ ವರ್ತಿಸುವ ಅತ್ಯುನ್ನತ ಸಂಸ್ಕಾರಯುತ ವ್ಯಕ್ತಿತ್ವ.",
    scorpio: "ಅತ್ಯಂತ ತೀಕ್ಷ್ಣ ಹಾಗೂ ಗಂಭೀರ ವ್ಯಕ್ತಿತ್ವ; ತಮ್ಮ ಅಂತರಂಗದ ಗುಟ್ಟನ್ನು ಯಾರ ಮುಂದೆಯೂ ಸುಲಭವಾಗಿ ಬಿಟ್ಟುಕೊಡದೆ, ಆಳವಾದ ಒಳನೋಟದಿಂದ ಜಗತ್ತನ್ನು ಗ್ರಹಿಸುತ್ತಾರೆ.",
    sagittarius: "ಮುಕ್ತ ಆಕಾಶದಂತಹ ಸ್ವತಂತ್ರ ಮನೋವೃತ್ತಿ, ಸತ್ಯನಿಷ್ಠೆ ಹಾಗೂ ಯಾರ ಮುಲಾಜಿಗೂ ಒಳಗಾಗದೆ ತನ್ನದೇ ಆದ ಉನ್ನತ ತತ್ವಗಳ ಮೇಲೆ ಬದುಕುವ ಧೀರ ವ್ಯಕ್ತಿತ್ವ.",
    capricorn: "ಚಿಕ್ಕ ವಯಸ್ಸಿನಲ್ಲೇ ದೊಡ್ಡ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಹೊತ್ತು ಬೆಳೆದ ಪಕ್ವ ವ್ಯಕ್ತಿತ್ವ; ಕೇವಲ ಅದೃಷ್ಟವನ್ನು ನೆಚ್ಚಿಕೊಳ್ಳದೆ, ಕಠಿಣ ಶ್ರಮ ಹಾಗೂ ಸಂಯಮದಿಂದಲೇ ಬುನಾದಿ ಕಟ್ಟುವ ಶ್ರಮಜೀವಿ.",
    aquarius: "ಸಮಾಜದ ಸಾಂಪ್ರದಾಯಿಕ ಕಟ್ಟುಪಾಡುಗಳಿಗೆ ಕುರುಡಾಗಿ ತಲೆಬಾಗದೆ, ತನ್ನದೇ ಆದ ಸ್ವತಂತ್ರ ಚಿಂತನೆ ಹಾಗೂ ಮಾನವೀಯ ದೃಷ್ಟಿಕೋನ ಹೊಂದಿರುವ ಮುಕ್ತ ಚಿಂತಕರು.",
    pisces: "ಅಪಾರ ಕರುಣೆ, ಪವಿತ್ರ ಅಂತಃಪ್ರಜ್ಞೆ ಹಾಗೂ ಇತರರ ಸುಖಕ್ಕಾಗಿ ತನ್ನ ಸುಖವನ್ನು ತ್ಯಾಗ ಮಾಡಲು ಸದಾ ಸಿದ್ಧವಿರುವ ಶುದ್ಧ ಸಾತ್ವಿಕ ಹೃದಯದ ವ್ಯಕ್ತಿತ್ವ."
  };

  const coreSignEn: Record<string, string> = {
    aries: "Endowed with fierce self-reliance and natural pioneering leadership, determined to forge their own path without leaning on anyone else.",
    taurus: "Radiates calm stability externally while anchoring an immovable, rock-solid determination and dignified self-reliance within.",
    gemini: "Possesses razor-sharp intellect, rapid comprehension, and an agile mind capable of mastering diverse challenges simultaneously.",
    cancer: "Maintains a protective exterior shield while guarding a deeply tender, loyal heart that places family and loved ones above all else.",
    leo: "Commands innate regal dignity and towering self-respect, refusing to bow down, grovel, or compromise personal sovereignty under any circumstance.",
    virgo: "Grounded in meticulous practical intelligence, analytical clarity, and an instinctive commitment to impeccable organization.",
    libra: "Epitomizes poise, cultural refinement, and diplomatic equilibrium, striving for fairness and harmony in every life engagement.",
    scorpio: "Carries penetrating psychological depth and quiet intensity, keeping personal sanctuaries closely guarded while reading situations effortlessly.",
    sagittarius: "Driven by an expansive, freedom-loving spirit and unyielding moral principles, charting life solely by personal truth and conviction.",
    capricorn: "Matured early through heavy responsibilities, constructing long-term security methodically through relentless discipline rather than superficial luck.",
    aquarius: "An independent visionary who rejects blind social dogmas, guided by progressive ideals and a unique, self-determined worldview.",
    pisces: "Blessed with intuitive depth, silent empathy, and a noble, selfless spirit that naturally senses and uplifts the burdens of others."
  };

  // Point 2: Anti-domination by element
  const isFire = ["aries", "leo", "sagittarius"].includes(lagnaKey);
  const isEarth = ["taurus", "virgo", "capricorn"].includes(lagnaKey);
  const isAir = ["gemini", "libra", "aquarius"].includes(lagnaKey);

  let antiDomKn = "";
  let antiDomEn = "";
  if (isFire) {
    antiDomKn = "ಯಾರಾದರೂ ಪ್ರೀತಿಯಿಂದ ಕೇಳಿದರೆ ಪ್ರಾಣವನ್ನಾದರೂ ಕೊಡುತ್ತಾರೆ; ಆದರೆ ಅಧಿಕಾರ ಚಲಾಯಿಸಿ ದರ್ಪ ತೋರಲು ಅಥವಾ ಆಜ್ಞಾಪಿಸಲು ಬಂದರೆ ಕಿಂಚಿತ್ತೂ ಸಹಿಸದೆ ತಕ್ಷಣವೇ ಜ್ವಾಲಾಮುಖಿಯಂತೆ ಸಿಡಿದೇಳುತ್ತಾರೆ.";
    antiDomEn = "Will go to the ends of the earth when requested with authentic warmth, but reacts with fiery fury if anyone attempts to order them around or act authoritarian.";
  } else if (isEarth) {
    antiDomKn = "ಪ್ರೀತಿ-ಗೌರವದಿಂದ ಹೇಳಿದರೆ ಕೆಲಸ ಮಾಡುತ್ತಾರೆ; ಆದರೆ ಯಾರಾದರೂ ದರ್ಪ ತೋರಿ ಬಲವಂತವಾಗಿ ನಿಯಂತ್ರಿಸಲು ಪ್ರಯತ್ನಿಸಿದರೆ, ಕಲ್ಲುಬಂಡೆಯಂತೆ ಪಟ್ಟುಹಿಡಿದು ಅವರ ಅಧಿಕಾರವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ವಿಫಲಗೊಳಿಸುತ್ತಾರೆ.";
    antiDomEn = "Responds gracefully to reasoned respect, but turns into an immovable stone wall if confronted with arrogance or heavy-handed micromanagement.";
  } else if (isAir) {
    antiDomKn = "ಬೌದ್ಧಿಕ ಸ್ವಾತಂತ್ರ್ಯವನ್ನು ಗೌರವಿಸುವವರೊಂದಿಗೆ ಚೆನ್ನಾಗಿರುತ್ತಾರೆ; ಆದರೆ ಯಾರಾದರೂ ಅನಗತ್ಯ ನಿಯಮಗಳನ್ನು ಹೇರಿ ಕೈಕಟ್ಟಿ ಹಾಕಲು ಬಂದರೆ, ಅವರ ಮಾತುಗಳಿಗೆ ಕಿವಿಗೊಡದೆ ಸದ್ದಿಲ್ಲದೆ ಅಲ್ಲಿಂದ ಜಾರಿಕೊಳ್ಳುತ್ತಾರೆ.";
    antiDomEn = "Thrives under intellectual mutual respect, but coldly dismisses and mentally detaches from anyone trying to impose suffocating boundaries or arbitrary dominance.";
  } else {
    antiDomKn = "ಪ್ರೀತಿ-ವಿಶ್ವಾಸಕ್ಕೆ ಇವರು ಸಂಪೂರ್ಣ ಶರಣಾಗುತ್ತಾರೆ; ಆದರೆ ಯಾರಾದರೂ ಕೀಳಾಗಿ ಕಂಡರೆ ಅಥವಾ ಅಧಿಕಾರ ಚಲಾಯಿಸಿದರೆ, ಮುಖತಃ ಜಗಳವಾಡದೆ ತಕ್ಷಣವೇ ಕಠಿಣ ಮೌನಕ್ಕೆ ಜಾರಿ ಸಂಪೂರ್ಣ ಅಂತರ ಕಾಯ್ದುಕೊಳ್ಳುತ್ತಾರೆ.";
    antiDomEn = "Yields completely to genuine affection, but instantly withdraws behind an impenetrable wall of icy silence if approached with condescension or disrespect.";
  }

  // Point 5: Innate radar
  let radarKn = "";
  let radarEn = "";
  if (["scorpio", "cancer", "pisces"].includes(lagnaKey) || ["ashlesha", "jyeshtha", "shatabhisha", "revati"].includes(nakKey)) {
    radarKn = "ಎದುರಿಗಿರುವ ವ್ಯಕ್ತಿಯ ಕಣ್ಣು ಹಾಗೂ ಮುಖಚರ್ಯೆಯಲ್ಲೇ ಅವರ ನೈಜ ಉದ್ದೇಶವನ್ನು ಗ್ರಹಿಸುತ್ತಾರೆ; ಕೃತಕ ನಗು, ಮುಖಸ್ತುತಿ ಅಥವಾ ಒಳಗೊಂದು ಹೊರಗೊಂದು ಇಟ್ಟುಕೊಂಡು ಬರುವವರನ್ನು ಮೊದಲ ಭೇಟಿಯಲ್ಲೇ ಅಳೆದುಬಿಡುತ್ತಾರೆ.";
    radarEn = "Equipped with an uncannily accurate intuitive radar; detects flattery, subtle deception, and hidden motives within seconds of interaction.";
  } else if (["gemini", "libra", "aquarius"].includes(lagnaKey)) {
    radarKn = "ಮಾತುಗಳಲ್ಲಿರುವ ಸಣ್ಣ ವೈರುಧ್ಯ ಅಥವಾ ಅಸಂಬದ್ಧತೆಯನ್ನೂ ಇವರು ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಹಿಡಿದುಬಿಡುತ್ತಾರೆ; ಬೂಟಾಟಿಕೆ ಹಾಗೂ ನಕಲಿ ಮಾತುಗಾರರನ್ನು ಇವರ ಎದುರು ಸಮರ್ಥಿಸಿಕೊಳ್ಳಲು ಸಾಧ್ಯವೇ ಇಲ್ಲ.";
    radarEn = "Catches contradictions in spoken arguments instantaneously; exposes intellectual pretenses and insincerity with effortless ease.";
  } else if (["virgo", "taurus", "capricorn"].includes(lagnaKey)) {
    radarKn = "ಮಾತಿನ ಆಡಂಬರಕ್ಕಿಂತ ಕೆಲಸದ ನೈಜತೆಯನ್ನು ನಂಬುತ್ತಾರೆ; ಬಾಯಿಮಾತಿನ ಬಡಾಯಿ ಕೊಚ್ಚುವವರನ್ನು ಹಾಗೂ ಭರವಸೆ ಕೊಟ್ಟು ತಪ್ಪಿಸುವವರನ್ನು ಮೊದಲ ನೋಟದಲ್ಲೇ ಪಕ್ಕಕ್ಕೆ ಸರಿಸುತ್ತಾರೆ.";
    radarEn = "Judges individuals strictly by consistency and execution; instantly filters out loud boasters and unreliable sweet-talkers.";
  } else {
    radarKn = "ಯಾರಾದರೂ ಕೃತಕ ಮುಖಸ್ತುತಿ ಮಾಡಿದರೆ ಇವರ ಅಂತರಂಗಕ್ಕೆ ತಕ್ಷಣವೇ ಮುಜುಗರ ಹಾಗೂ ಅಸಹ್ಯವಾಗುತ್ತದೆ; ಕಪಟ ನಾಟಕ ಮಾಡುವವರನ್ನು ಇವರು ಕಿಂಚಿತ್ತೂ ಹತ್ತಿರ ಸೇರಿಸುವುದಿಲ್ಲ.";
    radarEn = "Deeply repelled by sycophancy and fake flattery; naturally repulses anyone who operates with deceitful or manipulative intentions.";
  }

  // Point 7: Speech
  let candorKn = "";
  let candorEn = "";
  if (["aries", "leo", "sagittarius", "scorpio"].includes(lagnaKey)) {
    candorKn = "ಮಾತಿನಲ್ಲಿ ಮುಚ್ಚುಮರೆಯಿಲ್ಲದೆ ನೇರವಾಗಿ ಮುಖಕ್ಕೆ ಹೊಡೆದಂತೆ ಸತ್ಯ ಹೇಳಿಬಿಡುತ್ತಾರೆ; ಇವರ ಈ ಅತಿಯಾದ ನೇರ ನುಡಿಯು ಕೆಲವೊಮ್ಮೆ ಸೌಮ್ಯ ಮನಸ್ಸಿನವರಿಗೆ ಅಥವಾ ಅಪ್ರಾಮಾಣಿಕರಿಗೆ ಕಟುವಾಗಿ ತಟ್ಟುತ್ತದೆ.";
    candorEn = "Values raw truth far above flattering diplomacy; delivers unvarnished realities directly, which occasionally stings overly sensitive or evasive peers.";
  } else if (["taurus", "virgo", "capricorn"].includes(lagnaKey)) {
    candorKn = "ಮಾತನಾಡುವ ಮುನ್ನ ಯೋಚಿಸುತ್ತಾರೆ, ಆದರೆ ಒಮ್ಮೆ ಮಾತನಾಡಿದರೆ ತೂಕಬದ್ಧ ಹಾಗೂ ಖಚಿತ ನುಡಿಗಳನ್ನೇ ಆಡುತ್ತಾರೆ; ಅನಗತ್ಯ ಮಾತು ಅಥವಾ ಹರಟೆಗಳಲ್ಲಿ ಸಮಯ ವ್ಯರ್ಥ ಮಾಡುವುದಿಲ್ಲ.";
    candorEn = "Speaks with measured economy and undeniable precision, refusing to indulge in frivolous chatter, gossip, or unsubstantiated claims.";
  } else if (["gemini", "libra", "aquarius"].includes(lagnaKey)) {
    candorKn = "ಮಾತಿನಲ್ಲಿ ತಾರ್ಕಿಕ ಸ್ಪಷ್ಟತೆ ಹಾಗೂ ಚುರುಕುತನವಿದ್ದು, ವಾದದಲ್ಲಿ ಎದುರಾಳಿಯ ತಪ್ಪುಗಳನ್ನು ಸಲೀಸಾಗಿ ಬಯಲಿಗೆಳೆಯುತ್ತಾರೆ; ಆದರೆ ಅತಿಯಾದ ನಾಟಕೀಯ ಮಾತುಗಳನ್ನು ಇಷ್ಟಪಡುವುದಿಲ್ಲ.";
    candorEn = "Articulate and intellectually agile; disarms arguments effortlessly with logic and wit, while steering clear of emotional melodrama.";
  } else {
    candorKn = "ಸಾಮಾನ್ಯವಾಗಿ ಸೌಮ್ಯವಾಗಿ ಮಾತನಾಡುತ್ತಾರೆ, ಆದರೆ ತಮ್ಮ ಸ್ವಾಭಿಮಾನಕ್ಕೆ ಅಥವಾ ಕುಟುಂಬಕ್ಕೆ ಕಳಂಕ ಬರುವ ಸಂದರ್ಭದಲ್ಲಿ ಇವರ ಮಾತು ಅತ್ಯಂತ ತೀಕ್ಷ್ಣವಾಗಿ ಹಾಗೂ ಅನಿರೀಕ್ಷಿತವಾಗಿ ಚುಚ್ಚುತ್ತದೆ.";
    candorEn = "Habitually gentle and soft-spoken, yet capable of uttering devastatingly sharp, unforgettable truths if pushed beyond their emotional endurance.";
  }

  // Point 10: Perfectionism
  let perfKn = "";
  let perfEn = "";
  if (["virgo", "capricorn", "taurus"].includes(lagnaKey)) {
    perfKn = "ಯಾವುದೇ ಕೆಲಸವಾದರೂ ತನ್ನ ಕಣ್ಣಿಗೆ ತೃಪ್ತಿಯಾಗುವವರೆಗೂ ಮನಸ್ಸಿಗೆ ವಿಶ್ರಾಂತಿ ಸಿಗುವುದಿಲ್ಲ; ಇತರರು ಮಾಡಿದ ಕೆಲಸದಲ್ಲಿ ಸಣ್ಣ ಲೋಪ ಕಂಡರೂ ತಾವೇ ಸ್ವತಃ ಕೈಹಾಕಿ ಅಚ್ಚುಕಟ್ಟಾಗಿ ಸರಿಪಡಿಸುವ ಹಠ ಇವರಲ್ಲಿದೆ.";
    perfEn = "Compelled by an internal urge for perfection; restless until tasks meet exacting standards, often redoing others' haphazard work themselves.";
  } else if (["aries", "leo", "scorpio"].includes(lagnaKey)) {
    perfKn = "ಮಾಡಿದರೆ ಶ್ರೇಷ್ಠ ಮಟ್ಟದ ಕೆಲಸ ಮಾಡಬೇಕು, ಇಲ್ಲವಾದರೆ ಕೈಹಾಕಬಾರದು ಎಂಬ ಉನ್ನತ ಛಲ ಇವರಲ್ಲಿದೆ; ಅರ್ಧಂಬರ್ಧ ಕೆಲಸಗಳನ್ನು ಇವರು ಕಿಂಚಿತ್ತೂ ಒಪ್ಪುವುದಿಲ್ಲ.";
    perfEn = "Operates with an all-or-nothing mindset; demands excellence in everything undertaken and refuses to accept mediocre or half-baked results.";
  } else {
    perfKn = "ಕೆಲಸದಲ್ಲಿ ಅಚ್ಚುಕಟ್ಟುತನ, ಕ್ರಮಬದ್ಧತೆ ಹಾಗೂ ಸೌಂದರ್ಯವನ್ನು ಬಯಸುತ್ತಾರೆ; ಕೆಲಸ ಅಸ್ತವ್ಯಸ್ತವಾಗಿದ್ದರೆ ಅಥವಾ ನಿಯಮ ತಪ್ಪಿದ್ದರೆ ಇವರ ಮನಸ್ಸು ಪ್ರಕ್ಷುಬ್ಧಗೊಳ್ಳುತ್ತದೆ.";
    perfEn = "Deeply attuned to order, harmony, and thoroughness; becomes restless and mentally perturbed when processes are disorganized or chaotic.";
  }

  if (isKn) {
    return [
      {
        id: 1,
        text: coreSignKn[lagnaKey] || coreSignKn.aries,
        tone: "good",
        tagKn: "ಮೂಲ ಸ್ವಾಭಿಮಾನ",
        tagEn: "Sovereign Self-Respect"
      },
      {
        id: 2,
        text: antiDomKn,
        tone: "bad",
        tagKn: "ಆಜ್ಞಾಪನೆಗೆ ಅಸಹನೆ",
        tagEn: "Anti-Domination"
      },
      {
        id: 3,
        text: "ಇವರಿಗೆ ನೂರಾರು ಜನ ಪರಿಚಿತರಿರಬಹುದು, ಆದರೆ ಹೃದಯಪೂರ್ವಕವಾಗಿ ನಂಬುವುದು ಕೇವಲ ಬೆರಳೆಣಿಕೆಯ ಆಪ್ತರನ್ನು ಮಾತ್ರ; ಆ ಆಯ್ದ ಕೆಲವರಿಗಾಗಿ ಇವರು ಯಾವುದೇ ತ್ಯಾಗಕ್ಕೂ ಸದಾ ಸಿದ್ಧರಾಗಿರುತ್ತಾರೆ.",
        tone: "good",
        tagKn: "ಅಂತರಂಗದ ನಿಷ್ಠೆ",
        tagEn: "Selective Loyalty"
      },
      {
        id: 4,
        text: "ಹಿಂದೆ ತಾನು ತುಂಬು ಹೃದಯದಿಂದ ನಂಬಿದ ಕೆಲವರು ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ ಕೈಕೊಟ್ಟ ಅಥವಾ ಬೆನ್ನಿಗೆ ಚೂರಿ ಹಾಕಿದ ಕಹಿ ಗಾಯ ಇವರ ಮನಸ್ಸಿನಲ್ಲಿದೆ; ಅಂದಿನಿಂದ ಯಾರಾದರೂ ಒಮ್ಮೆ ವಿಶ್ವಾಸ ದ್ರೋಹ ಮಾಡಿದರೆ ಅವರಿಗೆ ಜೀವನದಲ್ಲಿ ಮತ್ತೆ ಎಂದಿಗೂ ಮೊದಲಿನ ಸ್ಥಾನ ನೀಡುವುದಿಲ್ಲ.",
        tone: "bad",
        tagKn: "ವಿಶ್ವಾಸಘಾತದ ಗಾಯ",
        tagEn: "Zero Second Chance"
      },
      {
        id: 5,
        text: radarKn,
        tone: "good",
        tagKn: "ಮುಖವಾಡಗಳ ಪತ್ತೆ",
        tagEn: "Innate Lie Detector"
      },
      {
        id: 6,
        text: "ತಮ್ಮ ಜೀವನದಲ್ಲಿ ಎಷ್ಟೇ ದೊಡ್ಡ ಆರ್ಥಿಕ ಅಥವಾ ಮಾನಸಿಕ ಬಿಕ್ಕಟ್ಟು ಬಂದರೂ, ಯಾರ ಮುಂದೆಯೂ ಹೋಗಿ ಕೈಚಾಚುವುದಿಲ್ಲ ಅಥವಾ ಕಣ್ಣೀರು ಹಾಕಿ ಅನುಕಂಪ ಬೇಡುವುದಿಲ್ಲ; ಎಲ್ಲ ನೋವನ್ನೂ ತಮ್ಮ ಎದೆಯೊಳಗೇ ನುಂಗಿಕೊಂಡು ಒಂಟಿಯಾಗಿ ಹೋರಾಡುತ್ತಾರೆ.",
        tone: "notice",
        tagKn: "ಮೌನ ಹೋರಾಟ",
        tagEn: "Silent Struggle"
      },
      {
        id: 7,
        text: candorKn,
        tone: "notice",
        tagKn: "ನೇರ ನುಡಿ",
        tagEn: "Unfiltered Candor"
      },
      {
        id: 8,
        text: "ಕೈಗೆತ್ತಿಕೊಂಡ ಕೆಲಸದಲ್ಲಿ ಶ್ರದ್ಧೆ ಹಾಗೂ ಚುರುಕುತನವನ್ನು ನಿರೀಕ್ಷಿಸುತ್ತಾರೆ; ಜೊತೆಯಲ್ಲಿರುವವರು ಸೋಮಾರಿತನ, ನಿಧಾನಗತಿ ಅಥವಾ ಬೇಜವಾಬ್ದಾರಿತನ ತೋರಿದರೆ ಇವರಿಗೆ ಒಳಗೊಳಗೇ ರಕ್ತ ಕುದಿಯುವಷ್ಟು ಕಿರಿಕಿರಿ ಉಂಟಾಗುತ್ತದೆ.",
        tone: "bad",
        tagKn: "ಬೇಜವಾಬ್ದಾರಿಗೆ ಅಸಹನೆ",
        tagEn: "Intolerance to Sluggishness"
      },
      {
        id: 9,
        text: "ಕಷ್ಟದಲ್ಲಿರುವ ಅರ್ಹ ವ್ಯಕ್ತಿಗಳಿಗೆ ಸದ್ದಿಲ್ಲದೆ ತಮ್ಮ ಕೈಲಾದ ಸಹಾಯ ಮಾಡುತ್ತಾರೆ; ಆದರೆ ಮಾಡಿದ ಉಪಕಾರವನ್ನು ಜಗತ್ತಿಗೆ ಡಂಗೂರ ಸಾರಿಕೊಳ್ಳುವುದು ಅಥವಾ ಪ್ರಚಾರ ಮಾಡಿಕೊಳ್ಳುವುದು ಇವರಿಗೆ ಸುತರಾಂ ಇಷ್ಟವಿಲ್ಲ.",
        tone: "good",
        tagKn: "ಸಾತ್ವಿಕ ಸಹಾಯ",
        tagEn: "Silent Benevolence"
      },
      {
        id: 10,
        text: perfKn,
        tone: "notice",
        tagKn: "ಪರಿಪೂರ್ಣತೆಯ ಹಠ",
        tagEn: "Relentless Perfectionism"
      },
      {
        id: 11,
        text: "ಹಗಲಿನಲ್ಲಿ ಎಲ್ಲರ ಮುಂದೆ ನಗುಮುಖದಿಂದ, ಗಟ್ಟಿಯಾಗಿ ಎಲ್ಲಾ ಹೊಣೆಗಾರಿಕೆಗಳನ್ನು ನಿಭಾಯಿಸಿದರೂ, ರಾತ್ರಿಯ ಏಕಾಂತದಲ್ಲಿ ಮನಸ್ಸು ವಿಶ್ರಾಂತಿ ಪಡೆಯದೆ ಭವಿಷ್ಯ, ಸ್ವಾವಲಂಬನೆ ಹಾಗೂ ಕುಟುಂಬದ ಬಗ್ಗೆ ಅತಿಯಾಗಿ ಚಿಂತಿಸುತ್ತದೆ.",
        tone: "bad",
        tagKn: "ಏಕಾಂತದ ಅತಿಚಿಂತನೆ",
        tagEn: "Midnight Overthinking"
      },
      {
        id: 12,
        text: "ಬದುಕಿನಲ್ಲಿ ಇವರು ಕಂಡ ಏಳು-ಬೀಳುಗಳು ಹಾಗೂ ಎದುರಿಸಿದ ಅಡೆತಡೆಗಳಿಗೆ ಬೇರೆಯವರಾಗಿದ್ದರೆ ಕುಸಿದು ಬೀಳುತ್ತಿದ್ದರು; ಆದರೆ ಇವರಲ್ಲಿರುವ ಅದ್ಭುತ ಆಂತರಿಕ ಮನೋಬಲವು ಪ್ರತಿಯೊಂದು ಪತನದ ನಂತರವೂ ಇವರನ್ನು ಇನ್ನಷ್ಟು ಬಲಿಷ್ಠವಾಗಿ ಎದ್ದು ನಿಲ್ಲುವಂತೆ ಮಾಡಿದೆ.",
        tone: "good",
        tagKn: "ಪುನಶ್ಚೇತನ ಶಕ್ತಿ",
        tagEn: "Unbreakable Resilience"
      }
    ];
  }

  return [
    {
      id: 1,
      text: coreSignEn[lagnaKey] || coreSignEn.aries,
      tone: "good",
      tagKn: "ಮೂಲ ಸ್ವಾಭಿಮಾನ",
      tagEn: "Sovereign Self-Respect"
    },
    {
      id: 2,
      text: antiDomEn,
      tone: "bad",
      tagKn: "ಆಜ್ಞಾಪನೆಗೆ ಅಸಹನೆ",
      tagEn: "Anti-Domination"
    },
    {
      id: 3,
      text: "Surrounded by a wide network of acquaintances, yet grants emotional entry only to a rare, rigorously vetted few—for whom they will sacrifice without hesitation.",
      tone: "good",
      tagKn: "ಅಂತರಂಗದ ನಿಷ್ಠೆ",
      tagEn: "Selective Loyalty"
    },
    {
      id: 4,
      text: "Carries an unhealed scar from past individuals who betrayed unconditional trust at a critical hour; consequently, once a line is crossed, second chances are permanently denied.",
      tone: "bad",
      tagKn: "ವಿಶ್ವಾಸಘಾತದ ಗಾಯ",
      tagEn: "Zero Second Chance"
    },
    {
      id: 5,
      text: radarEn,
      tone: "good",
      tagKn: "ಮುಖವಾಡಗಳ ಪತ್ತೆ",
      tagEn: "Innate Lie Detector"
    },
    {
      id: 6,
      text: "Never airs vulnerabilities or begs for external pity during crises; internalizes intense emotional and financial strain, fighting private battles with stoic dignity.",
      tone: "notice",
      tagKn: "ಮೌನ ಹೋರಾಟ",
      tagEn: "Silent Struggle"
    },
    {
      id: 7,
      text: candorEn,
      tone: "notice",
      tagKn: "ನೇರ ನುಡಿ",
      tagEn: "Unfiltered Candor"
    },
    {
      id: 8,
      text: "Expects dedication and urgency in shared responsibilities; experiences acute internal frustration when colleagues exhibit sluggishness, procrastination, or careless apathy.",
      tone: "bad",
      tagKn: "ಬೇಜವಾಬ್ದಾರಿಗೆ ಅಸಹನೆ",
      tagEn: "Intolerance to Sluggishness"
    },
    {
      id: 9,
      text: "Extends quiet financial and emotional help to deserving individuals without seeking public applause, self-promotion, or reciprocal favors.",
      tone: "good",
      tagKn: "ಸಾತ್ವಿಕ ಸಹಾಯ",
      tagEn: "Silent Benevolence"
    },
    {
      id: 10,
      text: perfEn,
      tone: "notice",
      tagKn: "ಪರಿಪೂರ್ಣತೆಯ ಹಠ",
      tagEn: "Relentless Perfectionism"
    },
    {
      id: 11,
      text: "Projects seamless composure and smiling competence throughout the day, yet battles an unquiet mind at night, overthinking future contingencies and responsibilities in solitude.",
      tone: "bad",
      tagKn: "ಏಕಾಂತದ ಅತಿಚಿಂತನೆ",
      tagEn: "Midnight Overthinking"
    },
    {
      id: 12,
      text: "Possesses extraordinary inner resilience; circumstances that would derail ordinary individuals merely forge their resolve, bouncing back stronger from every temporary reversal.",
      tone: "good",
      tagKn: "ಪುನಶ್ಚೇತನ ಶಕ್ತಿ",
      tagEn: "Unbreakable Resilience"
    }
  ];
}

/**
 * Builds deterministic, 100% authentic Shastric points for each of the First Six Sections.
 * Meets and exceeds the "at least 10 points" requirement under all conditions.
 */

// -------------------------------------------------------------
// CARD 2: ಅಂತರಂಗದ ಗುಪ್ತ ಆತಂಕ & ಚಿಂತೆ (Subconscious Worry - 100% Dynamic)
// -------------------------------------------------------------
export interface SubconsciousWorryOptions {
  moonSignEn: string;
  moonNakEn: string;
  moonHouse: number;
  hasVishYoga: boolean;      // Moon + Saturn conjunction or close aspect
  hasGrahanYoga: boolean;    // Moon + Rahu conjunction or aspect
  hasKetuYoga: boolean;      // Moon + Ketu
  hasMangalYoga: boolean;    // Moon + Mars (Chandra-Mangala)
  hasGajakesari: boolean;    // Moon with Jupiter or in Kendra from Jupiter
  isDusthanaMoon: boolean;   // Moon in 6, 8, 12
  isKemadruma: boolean;      // No planets around Moon
  age: number;
  isFemale: boolean;
  isKn: boolean;
  devoteeName?: string;
}

export function buildSubconsciousWorryPoints(opts: SubconsciousWorryOptions): AstrologerPointItem[] {
  const isKn = opts.isKn;
  const nakKn = toKannadaNakshatra(opts.moonNakEn);
  const nakEn = opts.moonNakEn || "Ashwini";
  const rashiKn = toKannadaRashi(opts.moonSignEn);
  const rashiEn = opts.moonSignEn || "Aries";

  const points: AstrologerPointItem[] = [];

  // 1. Astrological Mental Foundation
  points.push({
    id: 1,
    text: isKn
      ? `ಜಾತಕರ ಮನಃಕಾರಕ ಚಂದ್ರನು ${rashiKn} ರಾಶಿಯ '${nakKn}' ನಕ್ಷತ್ರದಲ್ಲಿದ್ದು, ${opts.moonHouse}ನೇ ಭಾವದ ಅಧಿಪತ್ಯದೊಂದಿಗೆ ಅಂತರಂಗದ ಮಾನಸಿಕ ನೆಮ್ಮದಿಯನ್ನು ನಿಯಂತ್ರಿಸುತ್ತಾನೆ.`
      : `Mind-significator Chandra occupies ${rashiEn} in the '${nakEn}' constellation, anchoring the subconscious emotional foundation from House ${opts.moonHouse}.`,
    tone: "normal",
    tagKn: "ಮಾನಸಿಕ ಆಧಾರ",
    tagEn: "Mental Foundation"
  });

  // 2. Midnight Overthinking / Nocturnal racing thoughts
  points.push({
    id: 2,
    text: isKn
      ? "ಹಗಲಿನಲ್ಲಿ ನಗುಮುಖದಿಂದ ಪ್ರತಿಯೊಬ್ಬರ ಜವಾಬ್ದಾರಿಯನ್ನು ಅಚ್ಚುಕಟ್ಟಾಗಿ ನಿಭಾಯಿಸಿದರೂ, ರಾತ್ರಿ ಏಕಾಂತದಲ್ಲಿ ಮನಸ್ಸು ವಿಶ್ರಾಂತಿ ಪಡೆಯದೆ ಭವಿಷ್ಯದ ಹೊಣೆಗಾರಿಕೆಗಳ ಬಗ್ಗೆ ಅತಿಯಾಗಿ ಚಿಂತಿಸುತ್ತದೆ."
      : "Maintains a composed, competent facade by day, yet battles nocturnal racing thoughts in solitude, overthinking future obligations and family responsibilities.",
    tone: "bad",
    tagKn: "ರಾತ್ರಿಯ ಅತಿಚಿಂತನೆ",
    tagEn: "Midnight Overthinking"
  });

  // 3. Vish Yoga / Saturn Pressure OR Silent Burden
  if (opts.hasVishYoga) {
    points.push({
      id: 3,
      text: isKn
        ? "ಶನಿ-ಚಂದ್ರರ ಪ್ರಭಾವದಿಂದ (ಶಾಸ್ತ್ರೋಕ್ತ ಪುನರ್ಫೂ / ವಿಷ ಯೋಗ): ಎಲ್ಲರ ಜವಾಬ್ದಾರಿಯನ್ನು ತಾನೊಬ್ಬನೇ ಹೊತ್ತು ತೀರಿಸುತ್ತಿದ್ದರೂ, ಒಳಗೊಳಗೇ ಒಂದು ನಿಗೂಢ ಒಂಟಿತನ ಹಾಗೂ 'ನನ್ನ ತ್ಯಾಗವನ್ನು ಯಾರೂ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತಿಲ್ಲ' ಎಂಬ ಮೌನ ವೇದನೆ ಕಾಡುತ್ತದೆ."
        : "Saturn-Moon influence (classical Punaphoo/Vish Yoga): Silently shoulders immense family loads alone, harboring a quiet melancholy that their sacrifices remain unappreciated.",
      tone: "bad",
      tagKn: "ವಿಷ ಯೋಗದ ಮೌನ ವೇದನೆ",
      tagEn: "Vish Yoga Melancholy"
    });
  } else {
    points.push({
      id: 3,
      text: isKn
        ? "ಕುಟುಂಬದವರಿಗೂ ಅಥವಾ ಆಪ್ತರಿಗೂ ಹೊರೆಯಾಗಬಾರದೆಂಬ ಉದ್ದೇಶದಿಂದ ತನ್ನ ಆಂತರಿಕ ನೋವು, ಆರ್ಥಿಕ ಒತ್ತಡಗಳು ಹಾಗೂ ಶ್ರಮವನ್ನು ಒಳಗೇ ನುಂಗಿಕೊಳ್ಳುವ ಮೌನ ಸಹನಶೀಲತೆ ಇದೆ."
        : "Habitual internalization of financial and familial burdens to protect loved ones from distress, carrying private pain without complaining.",
      tone: "bad",
      tagKn: "ಮೌನ ವೇದನೆ",
      tagEn: "Silent Burden"
    });
  }

  // 4. Grahan Yoga / Rahu Phobia OR Past Betrayal Scars
  if (opts.hasGrahanYoga) {
    points.push({
      id: 4,
      text: isKn
        ? "ರಾಹು-ಚಂದ್ರರ ಪ್ರಭಾವದಿಂದ (ಗ್ರಹಣ ಯೋಗ): ತಾನು ಸರಿ ಇದ್ದರೂ ಎಲ್ಲಿ ಅಪಾರ್ಥ, ಸುಳ್ಳು ಅಪವಾದ ಅಥವಾ ಸಾರ್ವಜನಿಕವಾಗಿ ಮಾನಹಾನಿ ಸಂಭವಿಸುವುದೋ ಎಂಬ ಕಣ್ಣಿಗೆ ಕಾಣದ ನಿಗೂಢ ಆತಂಕ ಮನಸ್ಸಿನ ಮೂಲೆಯಲ್ಲಿದೆ."
        : "Rahu-Moon conjunction (Grahan Yoga): Persistent, invisible fear of being misunderstood, falsely blamed, or suffering public indignity despite clean intentions.",
      tone: "bad",
      tagKn: "ಗ್ರಹಣ ಯೋಗದ ಆತಂಕ",
      tagEn: "Grahan Shadow Phobia"
    });
  } else {
    points.push({
      id: 4,
      text: isKn
        ? "ತಾನು ಅತಿಯಾಗಿ ನಂಬಿದ ಕೆಲವರು ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ ಕೈಕೊಟ್ಟ ಕಹಿ ನೆನಪುಗಳು ಮನಸ್ಸಿನ ಆಳದಲ್ಲಿ ಇನ್ನೂ ಮರೆಯಾಗದೆ, ಹೊಸಬರನ್ನು ಸುಲಭವಾಗಿ ನಂಬಲು ಬಿಡದ ಸೂಕ್ಷ್ಮ ಸಂಶಯ ಉಳಿಸಿದೆ."
        : "Deep emotional scars from past betrayals where trusted associates backed out at critical moments, leaving a guarded vigilance with newcomers.",
      tone: "bad",
      tagKn: "ವಿಶ್ವಾಸಘಾತದ ಗಾಯ",
      tagEn: "Past Betrayal Scar"
    });
  }

  // 5. Dusthana Moon (6/8/12) OR Somatic Stress
  if (opts.isDusthanaMoon) {
    points.push({
      id: 5,
      text: isKn
        ? "ಚಂದ್ರನು ತ್ರಿಕ ಸ್ಥಾನದಲ್ಲಿರುವುದರಿಂದ (6, 8, ಅಥವಾ 12ನೇ ಮನೆ), ಮಾನಸಿಕ ಒತ್ತಡ ಹೆಚ್ಚಾದಾಗ ಎದೆಯಲ್ಲಿ ದವದವಿಕೆ, ಹೊಟ್ಟೆಯಲ್ಲಿ ಆಮ್ಲೀಯತೆ (Acidity), ಗ್ಯಾಸ್ಟ್ರಿಕ್ ಅಥವಾ ನಿದ್ರಾಭಂಗದಂತಹ ಲಕ್ಷಣಗಳು ತಕ್ಷಣವೇ ಶಾರೀರಿಕವಾಗಿ ಪ್ರಕಟವಾಗುತ್ತವೆ."
        : "Moon in Dusthana (6th, 8th, or 12th house): Emotional stress immediately translates into somatic symptoms such as stomach acidity, erratic sleep, or chest restlessness.",
      tone: "bad",
      tagKn: "ದೈಹಿಕ ಒತ್ತಡದ ನೆರಳು",
      tagEn: "Somatic Stress"
    });
  } else {
    points.push({
      id: 5,
      text: isKn
        ? "ಹೊಟ್ಟೆಯಲ್ಲಿ ಆಮ್ಲೀಯತೆ (Acidity), ಕುತ್ತಿಗೆ-ಹೆಗಲು ಬಿಗಿತ ಅಥವಾ ನಿದ್ರಾಭಂಗದಂತಹ ಲಕ್ಷಣಗಳು ಜಾತಕರ ಮಾನಸಿಕ ಒತ್ತಡದ ಬಾಹ್ಯ ಪ್ರತಿಫಲನಗಳಾಗಿ ಪ್ರಕಟಗೊಳ್ಳುತ್ತವೆ."
        : "Physical manifestations of stress appear as sudden acidity, neck/shoulder stiffness, or shallow sleep during high-stakes deadlines.",
      tone: "bad",
      tagKn: "ಒತ್ತಡದ ನೆರಳು",
      tagEn: "Physical Fatigue"
    });
  }

  // 6. Chandra-Mangala Volatility OR Emotional Endurance
  if (opts.hasMangalYoga) {
    points.push({
      id: 6,
      text: isKn
        ? "ಕುಜ-ಚಂದ್ರರ ಪ್ರಭಾವದಿಂದ (ಚಂದ್ರ-ಮಂಗಳ ಯೋಗ): ಅನ್ಯಾಯ, ನಿಧಾನಗತಿ ಅಥವಾ ಬೇಜವಾಬ್ದಾರಿಯನ್ನು ಕಂಡಾಗ ಒಳಗೆ ಜ್ವಾಲಾಮುಖಿಯಂತೆ ತೀವ್ರ ಆಕ್ರೋಶ ಉಕ್ಕಿದರೂ, ಸಂಬಂಧಗಳು ಹಾಳಾಗಬಾರದೆಂದು ಹೊರಗೆ ಸಂಯಮದಿಂದ ಹದ್ದುಬಸ್ತಿನಲ್ಲಿಡುವ ಆಂತರಿಕ ತೊಳಲಾಟ."
        : "Mars-Moon interplay (Chandra-Mangala): Fierce internal indignation against sluggishness or injustice, fiercely bottled up to avoid rupturing delicate relationships.",
      tone: "notice",
      tagKn: "ಭಾವನಾತ್ಮಕ ತೊಳಲಾಟ",
      tagEn: "Emotional Fire Suppression"
    });
  } else {
    points.push({
      id: 6,
      text: isKn
        ? "ಯಾವುದೇ ಕೆಲಸವು ಶೇಕಡಾ 100 ರಷ್ಟು ಪರಿಪೂರ್ಣವಾಗಿ ಮುಗಿಯಬೇಕೆಂಬ ಪರಿಪೂರ್ಣತಾವಾದದ (Perfectionism) ಹಠದಿಂದ ತಾನೇ ತನಗೆ ಅತಿಯಾದ ಆತಂಕವನ್ನು ಸೃಷ್ಟಿಸಿಕೊಳ್ಳುತ್ತಾರೆ."
        : "Self-imposed perfectionist anxiety, feeling deeply unsettled when milestones achieve only 90% rather than flawless 100% execution.",
      tone: "notice",
      tagKn: "ಪರಿಪೂರ್ಣತೆಯ ಒತ್ತಡ",
      tagEn: "Perfectionist Anxiety"
    });
  }

  // 7. Kemadruma Loneliness OR Financial Vulnerability
  if (opts.isKemadruma) {
    points.push({
      id: 7,
      text: isKn
        ? "ಶಾಸ್ತ್ರೋಕ್ತ ಕೇಮದ್ರುಮ ಯೋಗದ ನೆರಳು: ಸುತ್ತಲೂ ಜನರು, ಸ್ನೇಹಿತರಿದ್ದರೂ ಕೊನೆಗೆ ನಾನೊಬ್ಬನೇ ಒಂಟಿಯಾಗಿ ನನ್ನ ಹೋರಾಟ ಮಾಡಬೇಕು ಎಂಬ ಏಕಾಂಗಿತನದ ಭಾವ ಕಾಡುತ್ತದೆ."
        : "Classical Kemadruma shadow: Despite being surrounded by people, feels fundamentally solitary, bearing the existential weight of fighting battles single-handedly.",
      tone: "bad",
      tagKn: "ಕೇಮದ್ರುಮ ಒಂಟಿತನ",
      tagEn: "Existential Solitude"
    });
  } else {
    points.push({
      id: 7,
      text: isKn
        ? "ಆರ್ಥಿಕ ಭದ್ರತೆಯ ವಿಷಯದಲ್ಲಿ ಸದಾ ಒಂದು ಅನಿಶ್ಚಿತತೆಯ ಭಯ ಕಾಡುತ್ತಿದ್ದು, ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ನಿರೀಕ್ಷಿತ ಮೊತ್ತ ಜಮೆಯಾಗುವವರೆಗೂ ಮನಸ್ಸಿನಲ್ಲಿ ದವದವಿಕೆ ಮುಂದುವರಿಯುತ್ತದೆ."
        : "Subconscious fear of sudden cash crunches, generating restlessness until funds are safely credited to the bank account.",
      tone: "notice",
      tagKn: "ಆರ್ಥಿಕ ಅನಿಶ್ಚಿತತೆ",
      tagEn: "Financial Vulnerability"
    });
  }

  // 8. Age-Specific Life Stage Worry
  if (opts.age < 24) {
    points.push({
      id: 8,
      text: isKn
        ? "ಶೈಕ್ಷಣಿಕ ಸ್ಪರ್ಧೆ, ಕರಿಯರ್ ದಿಕ್ಕು ಹಾಗೂ ಪೋಷಕರ ನಿರೀಕ್ಷೆಗಳನ್ನು ಪೂರ್ಣ ಪ್ರಮಾಣದಲ್ಲಿ ತಲುಪಲು ಸಾಧ್ಯವಾಗುವುದೇ ಎಂಬ ಯುವ ಸಹಜ ಆಂತರಿಕ ಅಂಜಿಕೆ."
        : "Anxiety regarding academic milestones, competitive cutoffs, and living up to familial expectations.",
      tone: "notice",
      tagKn: "ವಿದ್ಯಾ-ಕರಿಯರ್ ಚಿಂತೆ",
      tagEn: "Academic Crossroads"
    });
  } else if (opts.age < 36) {
    points.push({
      id: 8,
      text: isKn
        ? "ಸ್ವಂತ ಮನೆ/ವಾಹನ, ಆರ್ಥಿಕ ಸ್ವಾತಂತ್ರ್ಯ, ಕಂಕಣ ಭಾಗ್ಯ ಹಾಗೂ ಸ್ವಂತ ಕಾಲಮೇಲೆ ಸಮಾಜದಲ್ಲಿ ಗೌರವಯುತವಾಗಿ ನಿಲ್ಲುವ ಬಗೆಗಿನ ತುರ್ತಿನ ಯೋಚನೆಗಳು."
        : "Urgent pressure to achieve financial independence, establish domestic stability, and build a lasting reputation.",
      tone: "notice",
      tagKn: "ಸ್ಥಿರತೆಯ ಹಂಬಲ",
      tagEn: "Settlement Urgency"
    });
  } else if (opts.age < 56) {
    points.push({
      id: 8,
      text: isKn
        ? "ಮಕ್ಕಳ ಉನ್ನತ ವಿದ್ಯಾಭ್ಯಾಸ, ಸಾಲದ ಹೊರೆ ಇಳಿಸುವಿಕೆ ಹಾಗೂ ವೃತ್ತಿ ಕ್ಷೇತ್ರದಲ್ಲಿ ಮುಂದಿನ ಪೀಳಿಗೆಯ ಎದುರು ತನ್ನ ಪ್ರಭಾವ ಉಳಿಸಿಕೊಳ್ಳುವ ಗಂಭೀರ ಹೊಣೆಗಾರಿಕೆ."
        : "Heavy responsibilities balancing children's higher education, debt liquidation, and maintaining career authority.",
      tone: "notice",
      tagKn: "ಕುಟುಂಬದ ಜವಾಬ್ದಾರಿ",
      tagEn: "Family Burden"
    });
  } else {
    points.push({
      id: 8,
      text: isKn
        ? "ಮಕ್ಕಳ ವಿವಾಹ/ಸೆಟ್ಲ್ಮೆಂಟ್, ದೇಹದ ಚೈತನ್ಯ ಹಾಗೂ ಇಳಿವಯಸ್ಸಿನಲ್ಲಿ ಯಾರ ಮುಂದೆಯೂ ಕೈಚಾಚದೆ ಗೌರವದಿಂದ ಬಾಳುವ ಸ್ವಾಭಿಮಾನದ ಚಿಂತನೆಗಳು."
        : "Subconscious reflections on children's marital stability, bodily stamina, and preserving sovereign self-reliance in retirement.",
      tone: "notice",
      tagKn: "ಸ್ವಾಭಿಮಾನದ ನೆಮ್ಮದಿ",
      tagEn: "Dignified Retirement"
    });
  }

  // 9. Inner Resilience / Gaja Kesari / Purva Punya
  if (opts.hasGajakesari) {
    points.push({
      id: 9,
      text: isKn
        ? "ಗುರು-ಚಂದ್ರರ ಪರಮ ಪವಿತ್ರ ಗಜಕೇಸರಿ ಯೋಗದ ರಕ್ಷಣೆ: ಎಷ್ಟೇ ಸಂಕಷ್ಟ, ಅಪವಾದ ಅಥವಾ ವಿಪತ್ತು ಎದುರಾದರೂ, ಅಂತಿಮವಾಗಿ ಇವರ ಗೌರವ ಹಾಗೂ ಧರ್ಮಕ್ಕೆ ಯಾವುದೇ ಆಘಾತವಾಗದಂತೆ ದೈವವೇ ರಕ್ಷಿಸುತ್ತದೆ."
        : "Divine Gaja Kesari shield (Jupiter-Moon): Regardless of external turbulence or jealousy, divine grace ensures reputation and righteous standing remain unharmed.",
      tone: "good",
      tagKn: "ಗಜಕೇಸರಿ ಶ್ರೀರಕ್ಷೆ",
      tagEn: "Gaja Kesari Shield"
    });
  } else {
    points.push({
      id: 9,
      text: isKn
        ? "ಎಷ್ಟೇ ಆಂತರಿಕ ಬಿರುಗಾಳಿ ಎದ್ದರೂ, ಮುಖದಲ್ಲಿ ಸಮಚಿತ್ತ ಕಾಪಾಡಿಕೊಂಡು ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ನುಗ್ಗುವ ಅದ್ಭುತ ಸಹನಶಕ್ತಿ ಹಾಗೂ ಪುನಶ್ಚೇತನ ಶಕ್ತಿ ಜಾತಕರಲ್ಲಿದೆ."
        : "Rare internal endurance capable of absorbing immense private shocks without crumbling or neglecting outward duty, bouncing back stronger.",
      tone: "good",
      tagKn: "ಅಂತಃಸತ್ವ",
      tagEn: "Emotional Endurance"
    });
  }

  // 10. Solitude Rejuvenation
  points.push({
    id: 10,
    text: isKn
      ? "ಮನಸ್ಸನ್ನು ಪ್ರಶಾಂತಗೊಳಿಸಲು ಪುಣ್ಯಕ್ಷೇತ್ರ, ಪವಿತ್ರ ದೇವಸ್ಥಾನ ಅಥವಾ ಏಕಾಂತ ಧ್ಯಾನದ ವಾತಾವರಣವು ಜಾತಕರಿಗೆ ಅತೀವ ಚೇತರಿಕೆಯ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ."
      : "Spiritual sanctuaries, ancient temple courtyards, and silent walks in nature act as instant psychic therapy for the native.",
    tone: "good",
    tagKn: "ಏಕಾಂತ ಚೇತರಿಕೆ",
    tagEn: "Solitude Rejuvenation"
  });

  // 11. Upcoming Peace Window
  points.push({
    id: 11,
    text: isKn
      ? "ಮುಂಬರುವ ಶುಭ ದಶಾ-ಭುಕ್ತಿಯ ಪ್ರವೇಶದಿಂದ ಈ ಅಂತರಂಗದ ಆತಂಕದ ಮೋಡಗಳು ಕರಗಿ, ಆಂತರಿಕ ಪ್ರಶಾಂತತೆ ಹಾಗೂ ಧೈರ್ಯ ಮರುಕಳಿಸುವುದು ನಿಶ್ಚಿತ."
      : "The impending sub-dasha planetary shift is scheduled to dissolve these midnight anxieties, restoring baseline mental peace.",
    tone: "notice",
    tagKn: "ಶಾಂತಿ ಪ್ರವೇಶ",
    tagEn: "Upcoming Peace Window"
  });

  // 12. Sacred Mantra Shield
  points.push({
    id: 12,
    text: isKn
      ? "ಶ್ರೀ ಶಿವ ಪಂಚಾಕ್ಷರೀ ಜಪ ('ಓಂ ನಮಃ ಶಿವಾಯ') ಹಾಗೂ ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆಯಿಂದ ಮನಸ್ಸಿನ ಅಧೀರತೆ ದೂರವಾಗಿ, ನವೀನ ಆತ್ಮವಿಶ್ವಾಸ ನೆಲೆಗೊಳ್ಳಲಿದೆ."
      : "Devotional recitation of Shiva Panchakshari ('Om Namah Shivaya') and ancestral sankalpa shields the psyche against all anxieties.",
    tone: "good",
    tagKn: "ದೈವ ರಕ್ಷಣೆ",
    tagEn: "Divine Mental Shield"
  });

  return points;
}

// -------------------------------------------------------------
// CARD 3: 99% ಆದ ಕೆಲಸ ನಿಲ್ಲಿಸುವ 'ಮಾಂದಿ ಕರ್ಮ ಗಂಟು' (100% Dynamic 12-House Analysis)
// -------------------------------------------------------------
export interface MaandiKarmicOptions {
  maandiHouse: number;
  maandiLordKn: string;
  maandiLordEn: string;
  isKn: boolean;
  devoteeAge?: number;
}

export function buildMaandiKarmicPoints(opts: MaandiKarmicOptions): AstrologerPointItem[] {
  const isKn = opts.isKn;
  const mH = Math.max(1, Math.min(12, opts.maandiHouse || 1));
  const lordKn = opts.maandiLordKn || "ಶನಿ";
  const lordEn = opts.maandiLordEn || "Saturn";

  const points: AstrologerPointItem[] = [];

  // 1. Classical Foundation
  points.push({
    id: 1,
    text: isKn
      ? `ಶನಿಯ ಛಾಯಾ ಪುತ್ರನಾದ 'ಮಾಂದಿ' (ಗುಳಿಕ) ಗ್ರಹವು ಜನ್ಮ ಕುಂಡಲಿಯ ${mH}ನೇ ಭಾವದಲ್ಲಿದ್ದು, ಅಧಿಪತಿ ${lordKn} ಪ್ರಭಾವದಲ್ಲಿ ಕರ್ಮ ಗಂಟನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ.`
      : `Saturn's shadow satellite Maandi (Gulika) occupies House ${mH} under dispositor ${lordEn}, anchoring a specific last-mile karmic knot.`,
    tone: "normal",
    tagKn: "ಮಾಂದಿ ಸ್ಥಾನ ಸತ್ಯ",
    tagEn: "Maandi Alignment"
  });

  // 2. Initial Momentum
  points.push({
    id: 2,
    text: isKn
      ? "ಪ್ರಮುಖ ಕಾರ್ಯಗಳು ಆರಂಭದಲ್ಲಿ ಶೇಕಡಾ 50%, 80%, 90% ಮತ್ತು 99% ರಷ್ಟು ಅತ್ಯಂತ ಸುಲಭವಾಗಿ ಮುನ್ನಡೆದು ಅಂತಿಮ ಕ್ಷಣಕ್ಕೆ ತಲುಪುತ್ತವೆ."
      : "Major projects gain swift momentum through 50%, 80%, and 99% with great optimism and smooth cooperation.",
    tone: "normal",
    tagKn: "ಆರಂಭಿಕ ಪ್ರಗತಿ",
    tagEn: "Initial Momentum"
  });

  // 3 & 4. 100% Dynamic 12-House Specific 99% Stall Manifestation
  const HOUSE_STALL_MAP_KN: Record<number, { trigger: string; agony: string; tag: string }> = {
    1: {
      trigger: "ಇನ್ನೇನು ಅಂತಿಮ ವಿಜಯದ ಮೆಟ್ಟಿಲು ಹತ್ತಬೇಕು ಅನ್ನುವಾಗಲೇ, ಹಠಾತ್ ದೈಹಿಕ ಆಲಸ್ಯ, ತಲೆಭಾರ ಅಥವಾ 'ನನ್ನಿಂದ ಸಾಧ್ಯವೇ?' ಎಂಬ ಸ್ವಯಂ-ಸಂಶಯದಿಂದ ಕೆಲಸ ಸ್ಥಗಿತಗೊಳ್ಳುತ್ತದೆ!",
      agony: "ಆತ್ಮವಿಶ್ವಾಸದ ಕೊರತೆ ಅಥವಾ ಅಂತಿಮ ಕ್ಷಣದ ದೈಹಿಕ ಆಯಾಸದಿಂದಾಗಿ ಕೈಗೆ ಬಂದ ಗೆಲುವು ಕೈತಪ್ಪಿ ಹೋಗುವ ಪರಿಸ್ಥಿತಿ ನಿರ್ಮಾಣವಾಗುತ್ತದೆ.",
      tag: "ತನು ಸ್ಥಾನದ 99% ಗಂಟು"
    },
    2: {
      trigger: "ಇನ್ನೇನು ಹಣ ಕೈಸೇರಬೇಕು ಅಥವಾ ಆಸ್ತಿ/ವ್ಯಾಪಾರ ಒಪ್ಪಂದ ಮುಕ್ತಾಯವಾಗಬೇಕು ಅನ್ನುವಾಗಲೇ, ಮಾತಿನ ಚಕಮಕಿ ಅಥವಾ ತಾಂತ್ರಿಕ ಬ್ಯಾಂಕ್ ಕಾರಣದಿಂದ ಹಣ ಬಿಡುಗಡೆ ತಡೆಯಾಗುತ್ತದೆ!",
      agony: "ಬರಬೇಕಾದ ಧನಾಗಮನ ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಅಡೆತಡೆಗೆ ಸಿಲುಕಿ, ಸ್ನೇಹಿತರಿಗೆ ನೀಡಿದ ಹಣ ವಾಪಸ್ ಬರದೇ ತಿಂಗಳುಗಟ್ಟಲೆ ಎಳೆಯುತ್ತದೆ.",
      tag: "ಧನಕೋಶದ 99% ಗಂಟು"
    },
    3: {
      trigger: "ಇನ್ನೇನು ಒಪ್ಪಂದಕ್ಕೆ ಸಹಿ ಬೀಳಬೇಕು ಅಥವಾ ಪ್ರಮುಖ ಪ್ರಯಾಣ ಆರಂಭವಾಗಬೇಕು ಅನ್ನುವಾಗಲೇ, ಸಂವಹನದ ಅಚಾತುರ್ಯ ಅಥವಾ ಸಹೋದರ/ಸಹೋದ್ಯೋಗಿಗಳ ಅಸಹಕಾರದಿಂದ ಕೆಲಸ ನಿಲ್ಲುತ್ತದೆ!",
      agony: "ಪ್ರಯಾಣದ ದಾಖಲೆಗಳು, ಒಪ್ಪಂದದ ಕಡತಗಳು ಅಥವಾ ಪಾಲುದಾರರ ಸಹಿ ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ಕೈಕೊಡುತ್ತವೆ.",
      tag: "ಸಾಹಸ ಸ್ಥಾನದ 99% ಗಂಟು"
    },
    4: {
      trigger: "ಇನ್ನೇನು ಗೃಹಪ್ರವೇಶ, ಹೊಸ ವಾಹನ ಖರೀದಿ ಅಥವಾ ಆಸ್ತಿ ನೋಂದಣಿ ಆಗಬೇಕು ಅನ್ನುವಾಗಲೇ, ಸಬ್-ರಿಜಿಸ್ಟ್ರಾರ್ ಕಚೇರಿಯಲ್ಲಿ ಕಾಗದಪತ್ರದ ಕ್ಷುಲ್ಲಕ ಆಕ್ಷೇಪಣೆಯಿಂದ ಕೆಲಸ ನಿಲ್ಲುತ್ತದೆ!",
      agony: "ವಾಹನದ ಹಠಾತ್ ರಿಪೇರಿ, ಮನೆಯಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ದುರಸ್ತಿ ಅಥವಾ ಮಾತೃಶ್ರೀಯವರ ಆರೋಗ್ಯ ಚಿಂತೆಯಿಂದ ಖುಷಿಯ ಕ್ಷಣಗಳಲ್ಲಿ ನೆಮ್ಮದಿ ಕದಡುತ್ತದೆ.",
      tag: "ಸುಖ-ವಾಹನ 99% ಗಂಟು"
    },
    5: {
      trigger: "ಇನ್ನೇನು ಸಂತಾನ ಯೋಗ ಅಥವಾ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಉತ್ತೀರ್ಣರಾಗಬೇಕು ಅನ್ನುವಾಗಲೇ, ಕೇವಲ 1 ಅಂಕದಿಂದ ಅವಕಾಶ ತಪ್ಪುವುದು ಅಥವಾ ಅಂತಿಮ ಫಲಿತಾಂಶ ವಿಳಂಬವಾಗುತ್ತದೆ!",
      agony: "ಪೂರ್ವಪುಣ್ಯದ ಫಲ ಸಿಗುವ ಹಂತದಲ್ಲಿ ಕೊನೆ ಗಳಿಗೆಯ ಗೊಂದಲ, ಮರೆವು ಅಥವಾ ಮಕ್ಕಳ ವಿದ್ಯಾಭ್ಯಾಸದಲ್ಲಿ ಅನಿರೀಕ್ಷಿತ ತೊಡಕು ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ.",
      tag: "ವಿದ್ಯಾ-ಸಂತಾನ 99% ಗಂಟು"
    },
    6: {
      trigger: "ಇನ್ನೇನು ಸಾಲ ಮಂಜೂರಾಗಬೇಕು ಅಥವಾ ಶತ್ರುಗಳ ಮೇಲಿನ ವ್ಯಾಜ್ಯ ತೀರ್ಮಾನವಾಗಬೇಕು ಅನ್ನುವಾಗಲೇ, ಹೊಸ ತಕರಾರು ಅಥವಾ ಜೀರ್ಣಾಂಗದ ಆಸಿಡಿಟಿ ಬಾಧೆಯಿಂದ ಅಂತಿಮ ತೀರ್ಪು ಮುಂದೂಡಲ್ಪಡುತ್ತದೆ!",
      agony: "ಹೊಟ್ಟೆಯ ತೊಂದರೆ, ಕಚೇರಿಯ ಒಳಗಿನ ಗುಪ್ತ ಮತ್ಸರ ಹಾಗೂ ಸಾಲ ತೀರಿಸುವ ಕೊನೆಯ ಕಂತಿನ ವೇಳೆ ಅನಿರೀಕ್ಷಿತ ಧನ ಕೊರತೆ ಎದುರಾಗುತ್ತದೆ.",
      tag: "ಶತ್ರು-ಸಾಲ 99% ಗಂಟು"
    },
    7: {
      trigger: "ಇನ್ನೇನು ವಿವಾಹ ಸಂಬಂಧ ಗಟ್ಟಿಯಾಗಬೇಕು ಅಥವಾ ಬಿಸಿನೆಸ್ ಪಾಲುದಾರಿಕೆ ಆರಂಭವಾಗಬೇಕು ಅನ್ನುವಾಗಲೇ, ಅಂತಿಮ ಮಾತುಕತೆಯ ವೇಳೆ ಅತ್ಯಂತ ಕ್ಷುಲ್ಲಕ ಕಾರಣಕ್ಕೆ ಸಂಬಂಧ ಮುರಿದುಬೀಳುತ್ತದೆ!",
      agony: "ಕಂಕಣ ಭಾಗ್ಯದ ಅಂತಿಮ ಕ್ಷಣದಲ್ಲಿ ಮೂರನೆಯವರ ವಿನಾಕಾರಣ ಚಾಡಿಮಾತು ಅಥವಾ ಸಂಗಾತಿಯ ಅಂತರಂಗದ ತಂಪು ವರ್ತನೆಯಿಂದ ಮನಸ್ಸಿಗೆ ಆಘಾತವಾಗುತ್ತದೆ.",
      tag: "ಕಳತ್ರ-ವಿವಾಹ 99% ಗಂಟು"
    },
    8: {
      trigger: "ಇನ್ನೇನು ಪಿತ್ರಾರ್ಜಿತ ಆಸ್ತಿ, ವಿಮಾ ಕ್ಲೈಮ್ ಅಥವಾ ನಿವೃತ್ತಿಯ ಹಣ ಕೈಸೇರಬೇಕು ಅನ್ನುವಾಗಲೇ, ಕ್ಲೆರಿಕಲ್ ನಿಯಮಗಳ ನೆಪದಲ್ಲಿ ಕಡತ ಕಚೇರಿಗಳಲ್ಲಿ ಸಿಲುಕಿಕೊಳ್ಳುತ್ತದೆ!",
      agony: "ಅನಿರೀಕ್ಷಿತ ಆತಂಕ, ರಕ್ತದೊತ್ತಡದ ಏರುಪೇರು ಹಾಗೂ ಬರಬೇಕಾದ ಹಕ್ಕಿನ ಹಣಕ್ಕೆ ಅಧಿಕಾರಿಗಳ ಸುತ್ತ ಅಲೆಯುವಂತಹ ಪ್ರಸಂಗ ಬರುತ್ತದೆ.",
      tag: "ಆಯುರ್-ವಿಮಾ 99% ಗಂಟು"
    },
    9: {
      trigger: "ಇನ್ನೇನು ವಿದೇಶಿ ವೀಸಾ ಸಂದರ್ಶನ, ಉನ್ನತ ಪದವಿ ಅಥವಾ ಭಾಗ್ಯೋದಯದ ಹೆಜ್ಜೆ ಸಫಲವಾಗಬೇಕು ಅನ್ನುವಾಗಲೇ, ರಾಯಭಾರ ಕಚೇರಿಯಲ್ಲಿ ಅಥವಾ ಹಿರಿಯರ ವಿರೋಧದಿಂದ ತಡೆ ಉಂಟಾಗುತ್ತದೆ!",
      agony: "ಪಿತೃ ಕರ್ಮದ ಋಣದಿಂದಾಗಿ ಗುರು ಕೃಪೆ ಹಾಗೂ ಅದೃಷ್ಟದ ಬಾಗಿಲು ತೆರೆಯುವ ಕೊನೆಯ ಕ್ಷಣದಲ್ಲಿ ನಿಗೂಢ ವಿಳಂಬ ಉಂಟಾಗುತ್ತದೆ.",
      tag: "ಭಾಗ್ಯ-ಪಿತೃ 99% ಗಂಟು"
    },
    10: {
      trigger: "ಇನ್ನೇನು ಪ್ರಮೋಷನ್ ಪತ್ರ ಅಥವಾ ಉದ್ಯೋಗದ ಶ್ರೇಯಸ್ಸು ಸಿಗಬೇಕು ಅನ್ನುವಾಗಲೇ, 100% ದುಡಿದ ಜಾತಕರನ್ನು ಬಿಟ್ಟು ಕೆಲಸವೇ ಮಾಡದ ಬೇರೊಬ್ಬರಿಗೆ ಆ ಕ್ರೆಡಿಟ್ ಮತ್ತು ಪ್ರಶಸ್ತಿ ಸಿಗುತ್ತದೆ!",
      agony: "ಪ್ರಾಮಾಣಿಕವಾಗಿ ಬೆವರು ಸುರಿಸಿ ಕೆಲಸ ಮಾಡಿದರೂ, ಅಂತಿಮ ಪ್ರಮೋಷನ್ ಫೈಲ್ ನಿರ್ದೇಶಕರ ಟೇಬಲ್ ಮೇಲೆ ಕಾರಣವಿಲ್ಲದೆ ಧೂಳು ತಿನ್ನುತ್ತದೆ.",
      tag: "ಕರ್ಮ-ಪ್ರಮೋಷನ್ 99% ಗಂಟು"
    },
    11: {
      trigger: "ಇನ್ನೇನು ವರ್ಷದ ಬೋನಸ್, ದೊಡ್ಡ ಲಾಭದ ಮೊತ್ತ ಅಥವಾ ಪ್ರಮುಖ ಒಡಂಬಡಿಕೆಯ ಫಲ ಕೈಸೇರಬೇಕು ಅನ್ನುವಾಗಲೇ, ಪಾಲುದಾರರ ನಂಬಿಕೆದ್ರೋಹದಿಂದ ಲಾಭ ಕೈತಪ್ಪುತ್ತದೆ!",
      agony: "ಅತ್ಯಂತ ಆಪ್ತ ಸ್ನೇಹಿತರೆಂದು ನಂಬಿದವರು ಲಾಭ ಹಂಚಿಕೊಳ್ಳುವ ವೇಳೆ ಮುಖ ತಿರುಗಿಸಿ, ಹಕ್ಕಿನ ಲಾಭಾಂಶವನ್ನು ಕಸಿದುಕೊಳ್ಳುವ ಅನುಭವವಾಗುತ್ತದೆ.",
      tag: "ಲಾಭ-ಬೋನಸ್ 99% ಗಂಟು"
    },
    12: {
      trigger: "ಇನ್ನೇನು ಉಳಿತಾಯದ ಗುರಿ ಮುಟ್ಟಬೇಕು ಅಥವಾ ವಿದೇಶಿ ಪ್ರಯಾಣದ ವೀಸಾ ಮುದ್ರೆಯಾಗಬೇಕು ಅನ್ನುವಾಗಲೇ, ಅನಿರೀಕ್ಷಿತ ದಂಡ, ಆಸ್ಪತ್ರೆ ಖರ್ಚು ಅಥವಾ ಕಾಗದದ ಆಕ್ಷೇಪಣೆಯಿಂದ ಖರ್ಚು ಉಂಟಾಗುತ್ತದೆ!",
      agony: "ಬೆವರು ಸುರಿಸಿ ಕೂಡಿಸಿಟ್ಟ ಉಳಿತಾಯವು ಹಠಾತ್ ದುರಸ್ತಿ ಅಥವಾ ವ್ಯರ್ಥ ವೆಚ್ಚಗಳಿಗೆ ಸೋರಿಹೋಗಿ, ರಾತ್ರಿಯ ನಿದ್ರಾಭಂಗವನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ.",
      tag: "ವ್ಯಯ-ವಿದೇಶ 99% ಗಂಟು"
    }
  };

  const HOUSE_STALL_MAP_EN: Record<number, { trigger: string; agony: string; tag: string }> = {
    1: {
      trigger: "Right when the finish line is in sight, sudden physical lethargy, head heaviness, or self-sabotaging doubt paralyzes action!",
      agony: "A sudden energy dip or lack of confidence deprives the native of personal triumph at the very last step.",
      tag: "Ascendant 99% Knot"
    },
    2: {
      trigger: "Right when funds are due to credit or a financial pact is closing, a verbal dispute or clerical banking hold freezes liquid funds!",
      agony: "Receivable wealth gets snarled in last-minute verification, while money lent to associates remains stuck for months.",
      tag: "Wealth 99% Knot"
    },
    3: {
      trigger: "Right when contracts are to be inked or a crucial journey begins, communication misfires or uncooperative associates stall the pact!",
      agony: "Transit documents, travel visas, or partner signatures fail to arrive on the eve of execution.",
      tag: "Contract 99% Knot"
    },
    4: {
      trigger: "Right when buying a home, vehicle, or registering property, trivial registry objections or municipal delays freeze the paperwork!",
      agony: "Emergency vehicular breakdowns or maternal health worries disrupt domestic tranquility right before auspicious events.",
      tag: "Property 99% Knot"
    },
    5: {
      trigger: "Right when academic merit or progeny conception is imminent, missing a competitive cutoff by just 1 mark stalls the outcome!",
      agony: "Sudden creative block, memory slip during examinations, or progeny delays test emotional patience.",
      tag: "Intellect 99% Knot"
    },
    6: {
      trigger: "Right when loan sanctioning or debt clearance is closing, covert jealousy from colleagues or sudden stomach acidity causes postponement!",
      agony: "Digestive flare-ups on high-stakes days and bureaucratic objections delay loan disbursements.",
      tag: "Debt & Competition Knot"
    },
    7: {
      trigger: "Right when marriage alliances or partnership deals are finalizing, frivolous third-party gossip or sudden coldness derails the pact!",
      agony: "The alliance breaks down at the final discussion despite stellar astrological matching, causing acute shock.",
      tag: "Matrimonial 99% Knot"
    },
    8: {
      trigger: "Right when inheritance, insurance settlements, or gratuity are due, obscure legal clauses or tax notices lock the payout!",
      agony: "Running around administrative desks for legitimate dues while enduring sudden unexplainable anxiety.",
      tag: "Settlement 99% Knot"
    },
    9: {
      trigger: "Right when foreign visa interviews or higher education grants are due, embassy administrative processing delays the dream!",
      agony: "Ancestral pitru debt causes fortune's door to stall right at the counter despite flawless documentation.",
      tag: "Fortune & Visa Knot"
    },
    10: {
      trigger: "Right when promotions or formal commendations are awarded, the native who did 100% of the work is bypassed for a favored colleague!",
      agony: "Pours sweat and intellect into projects, yet the promotion dossier sits untouched on the chairman's desk.",
      tag: "Career Recognition Knot"
    },
    11: {
      trigger: "Right when annual bonuses, investment dividends, or major profits are due, partner deceit or corporate excuses withhold the payout!",
      agony: "Trusted associates turn indifferent when profit-sharing arrives, leaving rightful bonuses frozen.",
      tag: "Profit & Bonus Knot"
    },
    12: {
      trigger: "Right when savings reach a target or foreign relocation is scheduled, sudden hospital bills or visa holds drain the surplus!",
      agony: "Hard-earned liquid savings leak into sudden emergency repairs and medical bills, triggering insomnia.",
      tag: "Expenditure & Visa Knot"
    }
  };

  const currentStallKn = HOUSE_STALL_MAP_KN[mH] || HOUSE_STALL_MAP_KN[10];
  const currentStallEn = HOUSE_STALL_MAP_EN[mH] || HOUSE_STALL_MAP_EN[10];

  points.push({
    id: 3,
    text: isKn ? currentStallKn.trigger : currentStallEn.trigger,
    tone: "bad",
    tagKn: currentStallKn.tag,
    tagEn: currentStallEn.tag
  });

  points.push({
    id: 4,
    text: isKn ? currentStallKn.agony : currentStallEn.agony,
    tone: "bad",
    tagKn: "ಕೊನೆಯ ಮೈಲಿ ವೇದನೆ",
    tagEn: "Last-Mile Agony"
  });

  points.push({
    id: 5,
    text: isKn
      ? "ಪ್ರಾಮಾಣಿಕವಾಗಿ ಬೆವರು ಸುರಿಸಿ ದುಡಿದರೂ, ಅಂತಿಮ ಫಲಿತಾಂಶ ಸಿಗುವಾಗ 'ಕೈಯಿಗೆ ಬಂದ ತುತ್ತು ಬಾಯಿಗೆ ಬರಲಿಲ್ಲ' ಎಂಬಂತೆ ಆಗುವುದು ಇದರ ಮುಖ್ಯ ಲಕ್ಷಣ."
      : "The classic 'morsel reached the hand but missed the mouth' syndrome, where genuine sweat gets entangled in trivial technicalities.",
    tone: "bad",
    tagKn: "ಶ್ರಮಕ್ಕೆ ತಡೆ",
    tagEn: "Unearned Obstacles"
  });

  points.push({
    id: 6,
    text: isKn
      ? `ಈ ${mH}ನೇ ಭಾವದ ಮಾಂದಿ ದೋಷವು ಪೂರ್ವಜನ್ಮದ ಕರ್ಮದ ಋಣವಾಗಿದ್ದು, ವ್ಯಕ್ತಿಯ ತಾಳ್ಮೆ ಮತ್ತು ಸತ್ಯನಿಷ್ಠೆಯನ್ನು ಪರೀಕ್ಷಿಸುವ ಒಂದು ಕಠಿಣ ಒರೆಗಲ್ಲಾಗಿದೆ.`
      : `This House ${mH} Maandi knot originates from ancestral karmic residue, acting as an ethical crucible testing stamina before elevation.`,
    tone: "notice",
    tagKn: "ಕರ್ಮ ಪರೀಕ್ಷೆ",
    tagEn: "Karmic Crucible"
  });

  points.push({
    id: 7,
    text: isKn
      ? "ಆದರೆ ಮಾಂದಿ ಗ್ರಹವು ಕೆಲಸವನ್ನು ವಿಳಂಬ ಮಾಡಬಲ್ಲನೇ ಹೊರತು, ಸತತ ಪರಿಶ್ರಮ ಹಾಗೂ ದೈವಭಕ್ತಿ ಇರುವ ಜಾತಕರಿಗೆ ಯಶಸ್ಸನ್ನು ಶಾಶ್ವತವಾಗಿ ಕಸಿದುಕೊಳ್ಳಲಾರ!"
      : "Maandi can delay, test, and frustrate, but can NEVER permanently deny triumph to a determined, righteous native.",
    tone: "good",
    tagKn: "ಅಂತಿಮ ಜಯ",
    tagEn: "Eventual Triumph"
  });

  points.push({
    id: 8,
    text: isKn
      ? "ಸತತ ಪರಿಶ್ರಮ ಹಾಗೂ ಹಠ ಬಿಡದ ಪ್ರಯತ್ನದಿಂದ ಅಂತಿಮವಾಗಿ ವಿಜಯ ಲಭಿಸಲಿದೆ; ಕೇವಲ ಕೊನೆಯ 1% ತಡೆಯನ್ನು ನಿವಾರಿಸಿಕೊಳ್ಳುವುದು ಅಗತ್ಯ."
      : "Persistent resolve eventually overcomes the deadlock; dissolving that final 1% bottleneck is the sole requirement.",
    tone: "good",
    tagKn: "ಹಠದ ಜಯ",
    tagEn: "Resolute Victory"
  });

  points.push({
    id: 9,
    text: isKn
      ? `ಈ ${mH}ನೇ ಭಾವದ ಮಾಂದಿ ಕರ್ಮ ಗಂಟನ್ನು ಶಾಶ್ವತವಾಗಿ ನಿವಾರಿಸಲು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದಲ್ಲಿ 'ಮಾಂದಿ-ತಿಲ ಹೋಮ ಸಂಕಲ್ಪ' ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ ಪರಿಹಾರ.`
      : `To snap this House ${mH} Maandi knot permanently, sponsoring a dedicated 'Maandi Tila Homa Sankalpa' at Sri Kshetra Gokarna Mahabaleshwara is supreme.`,
    tone: "good",
    tagKn: "ಗೋಕರ್ಣ ಶಾಂತಿ",
    tagEn: "Gokarna Shanti"
  });

  points.push({
    id: 10,
    text: isKn
      ? "ದಿನನಿತ್ಯ ಪ್ರಾತಃಕಾಲ 'ಓಂ ಮಂದಪುತ್ರಾಯ ವಿದ್ಮಹೇ ಮೃತ್ಯುರೂಪಾಯ ಧೀಮಹಿ ತನ್ನೋ ಮಾಂದಿಃ ಪ್ರಚೋದಯಾತ್' ಮಂತ್ರವನ್ನು 11 ಬಾರಿ ಜಪಿಸುವುದು ಮಹತ್ವದ ರಕ್ಷಣಾ ನಿಯಮ."
      : "Daily morning recitation of the Maandi Gayatri (11 repetitions) erects an impermeable psychic shield against sudden glitches.",
    tone: "notice",
    tagKn: "ದೈನಂದಿನ ಮಂತ್ರ",
    tagEn: "Daily Mantra Shield"
  });

  points.push({
    id: 11,
    text: isKn
      ? "ಈ ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರದಿಂದ ವರ್ಷಗಳಿಂದ ಬಾಕಿ ಉಳಿದ ಕಡತಗಳು, ಧನಾಗಮನ ಹಾಗೂ ಸ್ಥಗಿತಗೊಂಡ ಕೆಲಸಗಳು ಶೀಘ್ರವಾಗಿ ಮುಕ್ತಾಯ ಕಾಣಲಿವೆ."
      : "Post-remedy, years of stalled files, delayed wire transfers, and blocked milestones experience rapid breakthrough completion.",
    tone: "good",
    tagKn: "ಕಾರ್ಯ ಸಿದ್ಧಿ ಯೋಗ",
    tagEn: "Hurdle Dissolution"
  });

  return points;
}

// -------------------------------------------------------------
// CARD 4: ಶಾರೀರಿಕ ಮಚ್ಚೆ ಗುರುತು & ತ್ರಿದೋಷ ಪ್ರಕೃತಿ (Anga Lakshana & Tridosha)
// -------------------------------------------------------------
export interface AngaLakshanaOptions {
  lagnaEn: string;
  lagnaLordEn: string;
  marsHouse?: number;
  sunHouse?: number;
  moonHouse?: number;
  isKn: boolean;
}

export function buildAngaLakshanaAndTridoshaPoints(opts: AngaLakshanaOptions): AstrologerPointItem[] {
  const isKn = opts.isKn;
  const lEn = (opts.lagnaEn || "Aries").toLowerCase();

  const LIMB_MAP_KN: Record<string, { limb: string; mark: string; tridosha: string; metabolism: string }> = {
    aries: { limb: "ಹಣೆ, ನೆತ್ತಿ ಅಥವಾ ಹುಬ್ಬಿನ ಸಮೀಪ", mark: "ಹುಟ್ಟು ಮಚ್ಚೆ, ಗಾಯದ ಕಲೆ ಅಥವಾ ಸೂಕ್ಷ್ಮ ಗುರುತು", tridosha: "ಪಿತ್ತ ಪ್ರಧಾನ (Pitta-Agni)", metabolism: "ಉಷ್ಣ ಶರೀರ, ತೀಕ್ಷ್ಣ ಹಸಿವು & ಕ್ಷಿಪ್ರ ಶಕ್ತಿ ವಿಕಿರಣ." },
    taurus: { limb: "ಕಂಠ, ಕುತ್ತಿಗೆ ಅಥವಾ ಗಲ್ಲದ ಬಲಭಾಗ", mark: "ಕಪ್ಪು ಅಥವಾ ಕಂದು ಬಣ್ಣದ ಆಕರ್ಷಕ ಮಚ್ಚೆ", tridosha: "ಕಫ-ವಾತ ಪ್ರಧಾನ (Kapha-Vata)", metabolism: "ದೃಢ ಶರೀರ ರಚನೆ, ಆಕರ್ಷಕ ಕಂಠಧ್ವನಿ & ಸ್ಥಿರ ಚಯಾಪಚಯ." },
    gemini: { limb: "ಬಲ ಹೆಗಲು, ತೋಳು ಅಥವಾ ಮುಂಗೈ ಭಾಗ", mark: "ಸಣ್ಣ ಮಚ್ಚೆ ಅಥವಾ ಗಾಯದ ಗುರುತು", tridosha: "ವಾತ ಪ್ರಧಾನ (Vata-Agility)", metabolism: "ಚುರುಕಾದ ನರಮಂಡಲ, ಕ್ಷಿಪ್ರ ಗ್ರಹಣ ಶಕ್ತಿ & ತೆಳು ಶರೀರ." },
    cancer: { limb: "ಎದೆಯ ಭಾಗ, ಪಕ್ಕೆಲುಬು ಅಥವಾ ಹೊಟ್ಟೆಯ ಮೇಲ್ಭಾಗ", mark: "ತಿಳಿ ಬಣ್ಣದ ನೈಸರ್ಗಿಕ ಮಚ್ಚೆ ಗುರುತು", tridosha: "ಕಫ-ಜಲ ಪ್ರಧಾನ (Kapha-Jala)", metabolism: "ಸೂಕ್ಷ್ಮ ಜೀರ್ಣಕ್ರಿಯೆ, ನೀರಿನಂಶದ ಏರುಪೇರು & ಶೀತ ಪ್ರವೃತ್ತಿ." },
    leo: { limb: "ಬೆನ್ನಿನ ಮೇಲ್ಭಾಗ, ಭುಜ ಅಥವಾ ಎದೆಯ ಬಲಭಾಗ", mark: "ರಾಜಲಕ್ಷಣದ ಸ್ಪಷ್ಟ ಮಚ್ಚೆ ಅಥವಾ ಕಲೆ", tridosha: "ಪಿತ್ತ-ತೇಜಸ್ಸು ಪ್ರಧಾನ (Pitta-Tejas)", metabolism: "ಉನ್ನತ ಚೈತನ್ಯ, ಸದೃಢ ಮೂಳೆಗಳು & ಸಹಜ ರಾಜಗಾಂಭೀರ್ಯ." },
    virgo: { limb: "ಸೊಂಟದ ಭಾಗ, ಹೊಟ್ಟೆ ಅಥವಾ ಕಟಿ ಪ್ರದೇಶ", mark: "ಚಿಕ್ಕ ಸೂಕ್ಷ್ಮ ಮಚ್ಚೆ ಅಥವಾ ಗಾಯದ ಕಲೆ", tridosha: "ವಾತ-ಪಿತ್ತ ಪ್ರಧಾನ (Vata-Pitta)", metabolism: "ಸೂಕ್ಷ್ಮ ಕರುಳಿನ ಜೀರ್ಣಕ್ರಿಯೆ, ಶುಚಿತ್ವ ಪ್ರಿಯತೆ & ಆಹಾರ ಪಥ್ಯ." },
    libra: { limb: "ಹೊಟ್ಟೆಯ ಕೆಳಭಾಗ, ನಡು ಅಥವಾ ಸೊಂಟದ ಎಡಭಾಗ", mark: "ಅಂದವಾದ ಸೌಂದರ್ಯವರ್ಧಕ ಮಚ್ಚೆ", tridosha: "ವಾತ-ಕಫ ಸಮತೋಲನ (Vata-Kapha)", metabolism: "ಸಮತೋಲಿತ ದೇಹರಚನೆ, ನಯವಾದ ಚರ್ಮ & ಸೌಮ್ಯ ಕಳೆ." },
    scorpio: { limb: "ಕಟಿ ಪ್ರದೇಶ, ತೊಡೆ ಸಂಧಿ ಅಥವಾ ಗುಪ್ತ ಭಾಗಗಳ ಸಮೀಪ", mark: "ನಿಗೂಢ ಕಪ್ಪು ಮಚ್ಚೆ ಅಥವಾ ಹಳೆಯ ಕಲೆ", tridosha: "ಪಿತ್ತ-ಜಲ ಪ್ರಧಾನ (Pitta-Jala)", metabolism: "ಆಳವಾದ ಪುನರುಜ್ಜೀವನ ಶಕ್ತಿ, ತೀಕ್ಷ್ಣ ದೃಷ್ಟಿ & ಸಹಿಷ್ಣುತೆ." },
    sagittarius: { limb: "ಬಲ ತೊಡೆ, ಪೃಷ್ಠ ಅಥವಾ ಸೊಂಟದ ಹಿಂಭಾಗ", mark: "ಗುರುತಿಸಬಹುದಾದ ಮಚ್ಚೆ ಅಥವಾ ಗಾಯದ ಗುರುತು", tridosha: "ಪಿತ್ತ-ವಾತ ಪ್ರಧಾನ (Pitta-Vata)", metabolism: "ಉದ್ದವಾದ ನಿಲವು, ಕ್ರೀಡಾ ಶಕ್ತಿ & ಕ್ರಿಯಾಶೀಲ ಶರೀರ." },
    capricorn: { limb: "ಮಂಡಿ ಚಿಪ್ಪು, ಮೊಣಕಾಲು ಅಥವಾ ಕೀಲುಗಳ ಸಮೀಪ", mark: "ಹಳೆಯ ಬಿದ್ದ ಗಾಯದ ಕಲೆ ಅಥವಾ ಗಾಢ ಮಚ್ಚೆ", tridosha: "ವಾತ-ಶೀತ ಪ್ರಧಾನ (Vata-Cold)", metabolism: "ಬಲಿಷ್ಠ ಮೂಳೆಗಳು, ಕೀಲು ನೋವಿನ ಸೂಕ್ಷ್ಮತೆ & ದೀರ್ಘ ಸಹಿಷ್ಣುತೆ." },
    aquarius: { limb: "ಪಿಕ್ಕಾಲು, ಮೊಣಕಾಲು ಕೆಳಭಾಗ ಅಥವಾ ಹಿಮ್ಮಡಿ", mark: "ವಿಶಿಷ್ಟ ಮಚ್ಚೆ ಅಥವಾ ಚರ್ಮದ ಗುರುತು", tridosha: "ವಾತ ಪ್ರಧಾನ (Vata-Air)", metabolism: "ರಕ್ತ ಪರಿಚಲನೆಯ ಸೂಕ್ಷ್ಮತೆ, ಚರ್ಮದ ಶುಷ್ಕತೆ & ಆಳವಾದ ಚಿಂತನೆ." },
    pisces: { limb: "ಪಾದ, ಹಿಮ್ಮಡಿ ಅಥವಾ ಕಾಲ್ಬೆರಳುಗಳ ಸಮೀಪ", mark: "ಮೃದುವಾದ ಮಚ್ಚೆ ಅಥವಾ ಜಲ ಚಿಹ್ನೆ", tridosha: "ಕಫ-ಜಲ ಪ್ರಧಾನ (Kapha-Jala)", metabolism: "ಮೃದು ಪಾದಗಳು, ಶೀತ-ಕಫ ಪ್ರವೃತ್ತಿ & ಸೂಕ್ಷ್ಮ ನಿದ್ರಾ ವ್ಯವಸ್ಥೆ." }
  };

  const currentLimb = LIMB_MAP_KN[lEn] || LIMB_MAP_KN.aries;

  const points: AstrologerPointItem[] = [];

  points.push({
    id: 1,
    text: isKn
      ? "ಬೃಹತ್ ಜಾತಕ ಅಧ್ಯಾಯ 25ರ ಅಂಗ ಲಕ್ಷಣ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ, ಜನ್ಮ ಲಗ್ನದ ಆಧಾರದ ಮೇಲೆ ಶರೀರದಲ್ಲಿ ನೈಸರ್ಗಿಕ ಮಚ್ಚೆ ಗುರುತುಗಳು ನಿರ್ಧಾರವಾಗುತ್ತವೆ."
      : "According to Brihat Jataka Chapter 25 Anga Lakshana, the rising sign dictates natural physical birthmarks.",
    tone: "normal",
    tagKn: "ಅಂಗ ಲಕ್ಷಣ ಸತ್ಯ",
    tagEn: "Anga Lakshana Foundation"
  });

  points.push({
    id: 2,
    text: isKn
      ? `ಜಾತಕರ ${currentLimb.limb} ಭಾಗದಲ್ಲಿ ಗಮನಾರ್ಹವಾದ ${currentLimb.mark} ಇರುವುದು ಇವರ ಶಾರೀರಿಕ ಗುರುತಾಗಿದೆ.`
      : `Possesses a prominent birthmark, scar, or distinct beauty mark near the ${opts.lagnaEn} bodily region.`,
    tone: "notice",
    tagKn: "ಹುಟ್ಟು ಮಚ್ಚೆ ಗುರುತು",
    tagEn: "Physical Birthmark"
  });

  points.push({
    id: 3,
    text: isKn
      ? `ಆಯುರ್ವೇದ ತ್ರಿದೋಷ ಶಾಸ್ತ್ರದಂತೆ ಜಾತಕರು '${currentLimb.tridosha}' ಶರೀರ ಪ್ರಕೃತಿಯನ್ನು ಹೊಂದಿದ್ದಾರೆ.`
      : `Governed by '${currentLimb.tridosha}' constitution according to classical Ayurvedic Tridosha physiology.`,
    tone: "normal",
    tagKn: "ತ್ರಿದೋಷ ಪ್ರಕೃತಿ",
    tagEn: "Tridosha Constitution"
  });

  points.push({
    id: 4,
    text: isKn
      ? `ಚಯಾಪಚಯ ಲಕ್ಷಣ: ${currentLimb.metabolism}`
      : `Metabolic characteristics: High resilience with specific metabolic rhythms tuned to their ascendant.`,
    tone: "normal",
    tagKn: "ಚಯಾಪಚಯ ಲಕ್ಷಣ",
    tagEn: "Metabolic Profile"
  });

  points.push({
    id: 5,
    text: isKn
      ? "ಮಾನಸಿಕ ಆತಂಕ ಅಥವಾ ಅತಿಯಾದ ಕೆಲಸದ ಒತ್ತಡ ಉಂಟಾದಾಗ ಶರೀರದಲ್ಲಿ ಉಷ್ಣಾಂಶ ಅಥವಾ ಜೀರ್ಣಾಂಗದಲ್ಲಿ ಆಸಿಡಿಟಿ ಏರುಪೇರಾಗುವುದು ಸಹಜ."
      : "Vulnerable to stress-induced digestive acidity and metabolic heat surges during demanding operational periods.",
    tone: "bad",
    tagKn: "ಉಷ್ಣದ ಸೂಕ್ಷ್ಮತೆ",
    tagEn: "Pitta/Heat Vulnerability"
  });

  points.push({
    id: 6,
    text: isKn
      ? "ಕೈಗೆತ್ತಿಕೊಂಡ ಕೆಲಸಗಳಲ್ಲಿ ಆಯಾಸವನ್ನು ಲೆಕ್ಕಿಸದೆ ನಿರಂತರವಾಗಿ ಶ್ರಮಿಸುವ ಶಾರೀರಿಕ ತ್ರಾಣ ಹಾಗೂ ಅಪ್ರತಿಮ ಸಹನಶಕ್ತಿ ಜಾತಕರಲ್ಲಿದೆ."
      : "Endowed with uncommon physical stamina, capable of sustaining grueling working hours when driven by duty.",
    tone: "good",
    tagKn: "ಶಾರೀರಿಕ ತ್ರಾಣ",
    tagEn: "Physical Stamina"
  });

  points.push({
    id: 7,
    text: isKn
      ? "ಕಣ್ಣುಗಳಲ್ಲಿ ತೀಕ್ಷ್ಣ ಹೊಳಪು ಹಾಗೂ ಎದುರಿಗಿರುವವರ ಉದ್ದೇಶಗಳನ್ನು ಮುಖ ನೋಡಿಯೇ ಗ್ರಹಿಸುವ ಸಹಜ ದೃಷ್ಟಿ ಬಲವಿದೆ."
      : "Possesses a penetrating gaze with natural face-reading instinct that immediately discerns ulterior motives.",
    tone: "good",
    tagKn: "ತೀಕ್ಷ್ಣ ದೃಷ್ಟಿ",
    tagEn: "Penetrating Gaze"
  });

  points.push({
    id: 8,
    text: isKn
      ? "ಶೀತಲ ಪಾನೀಯ, ತಂಪು ಆಹಾರ ಅಥವಾ ಅನಿಯಮಿತ ಸಮಯದ ಊಟದಿಂದ ಗ್ಯಾಸ್ಟ್ರಿಕ್ ಅಥವಾ ಕೀಲುಗಳ ಜಡತ್ವ ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು; ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಆಹಾರ ಸೇವಿಸುವುದು ಕ್ಷೇಮ."
      : "Irregular meal schedules and excessive chilled foods provoke gastric distress; timely warm nutrition is essential.",
    tone: "bad",
    tagKn: "ಆಹಾರ ಪಥ್ಯ",
    tagEn: "Dietary Vigilance"
  });

  points.push({
    id: 9,
    text: isKn
      ? "ದಿನನಿತ್ಯ ಪ್ರಾತಃಕಾಲ ತಾಮ್ರದ ಪಾತ್ರೆಯ ನೀರು ಸೇವನೆ ಹಾಗೂ ಸೂರ್ಯ ನಮಸ್ಕಾರದಿಂದ ದೇಹದ ತ್ರಿದೋಷ ಸಮತೋಲನಗೊಂಡು, ಕಾಂತಿ ಹೆಚ್ಚುತ್ತದೆ."
      : "Drinking water stored in copper vessels at sunrise restores cellular balance and revitalizes metabolic luster.",
    tone: "good",
    tagKn: "ಆಯುರ್ವೇದ ರಕ್ಷಣೆ",
    tagEn: "Ayurvedic Regimen"
  });

  points.push({
    id: 10,
    text: isKn
      ? "ದೇಹದ ನೈಸರ್ಗಿಕ ಚೈತನ್ಯವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲು 6 ರಿಂದ 7 ಗಂಟೆಗಳ ಆಳವಾದ ನಿದ್ರೆ ಅತ್ಯಂತ ಅನಿವಾರ್ಯ."
      : "Requires 6 to 7 hours of undisturbed deep sleep to recharge the nervous system and clear mental fog.",
    tone: "notice",
    tagKn: "ನಿದ್ರಾ ಮಹತ್ವ",
    tagEn: "Restorative Sleep"
  });

  points.push({
    id: 11,
    text: isKn
      ? "ಲಗ್ನಾಧಿಪತಿಯ ಗ್ರಹಬಲದಿಂದಾಗಿ ಯಾವುದೇ ತಾತ್ಕಾಲಿಕ ಅನಾರೋಗ್ಯ ಎದುರಾದರೂ ಅದ್ಭುತವಾಗಿ ರೋಗನಿರೋಧಕ ಶಕ್ತಿಯಿಂದ ಗುಣಮುಖರಾಗುವ ವರಪ್ರಸಾದವಿದೆ."
      : "Robust immune resilience ensures rapid, full recovery from temporary physical ailments without lingering weakness.",
    tone: "good",
    tagKn: "ರೋಗನಿರೋಧಕ ಶಕ್ತಿ",
    tagEn: "Immune Vitality"
  });

  return points;
}

// -------------------------------------------------------------
// CARD 5: ಕರ್ಮ ಸ್ಥಾನ & ವಾಸ್ತವಿಕ ಆರ್ಥಿಕ ಸ್ಥಿತಿ (Karma & Financial Reality)
// -------------------------------------------------------------
export interface KarmaFinancialOptions {
  tenthSignKn: string;
  tenthLordKn: string;
  amatyakarakaKn: string;
  amatyakarakaEn: string;
  isKn: boolean;
}

export function buildKarmaFinancialPoints(opts: KarmaFinancialOptions): AstrologerPointItem[] {
  const isKn = opts.isKn;

  const points: AstrologerPointItem[] = [];

  points.push({
    id: 1,
    text: isKn
      ? `10ನೇ ಕರ್ಮ ಸ್ಥಾನವು ${opts.tenthSignKn} ರಾಶಿಯಾಗಿದ್ದು, ಕರ್ಮಾಧಿಪತಿ ${opts.tenthLordKn} ಹಾಗೂ ಜೈಮಿನಿ ಅಮಾತ್ಯಕಾರಕ ${opts.amatyakarakaKn} ವೃತ್ತಿ ದಿಕ್ಕನ್ನು ನಿರ್ಧರಿಸುತ್ತಾರೆ.`
      : `10th House of Karma and Jaimini Amatyakaraka ${opts.amatyakarakaEn} anchor professional vocation and earned authority.`,
    tone: "normal",
    tagKn: "ಕರ್ಮ ಸ್ಥಾನ ಸತ್ಯ",
    tagEn: "10th House Alignment"
  });

  points.push({
    id: 2,
    text: isKn
      ? "ಯಾರ ಕೈಕೆಳಗೂ ಗುಲಾಮರಂತೆ ಬಗ್ಗಿ ದುಡಿಯಲು ಇವರ ಸ್ವಾಭಿಮಾನ ಒಪ್ಪದು; ಸ್ವತಂತ್ರ ನಿರ್ಧಾರ, ಅಧಿಕಾರ ಅಥವಾ ಗೌರವಯುತ ಸ್ಥಾನಮಾನವಿರುವ ಕ್ಷೇತ್ರದಲ್ಲೇ ಇವರು ಶೈನ್ ಆಗುತ್ತಾರೆ."
      : "Fierce professional self-respect rejects demeaning subservience; thrives exclusively where autonomy, respect, and authority are granted.",
    tone: "good",
    tagKn: "ಸ್ವಾವಲಂಬಿ ನಾಯಕತ್ವ",
    tagEn: "Autonomous Leadership"
  });

  points.push({
    id: 3,
    text: isKn
      ? "ತಾನು ಶೇಕಡಾ 100 ರಷ್ಟು ಪ್ರಾಮಾಣಿಕವಾಗಿ ಪರಿಶ್ರಮಪಟ್ಟರೂ, ಆ ಕ್ಷಣದಲ್ಲಿ ಕ್ರೆಡಿಟ್ ಅಥವಾ ಗೌರವ ತಕ್ಷಣವೇ ಸಿಗದೆ, ಕೆಲವೊಮ್ಮೆ ಬೇರೆಯವರ ಪಾಲಾಗುವ ಕಹಿ ಅನುಭವ ಎದುರಾಗಿದೆ."
      : "Experienced instances where their uncredited toil yielded breakthroughs, yet opportunists swooped in to claim immediate corporate applause.",
    tone: "bad",
    tagKn: "ಶ್ರಮಕ್ಕೆ ತಡವಾದ ಮನ್ನಣೆ",
    tagEn: "Delayed Accolades"
  });

  points.push({
    id: 4,
    text: isKn
      ? "ಆದರೆ ಜಾತಕರ ಅದ್ಭುತ ಪ್ರತಿಭೆ ಹಾಗೂ ಅನಿವಾರ್ಯತೆಯನ್ನು ಯಾರೂ ಶಾಶ್ವತವಾಗಿ ಕಡೆಗಣಿಸಲಾರರು; ಕೊನೆಗೆ ಇವರೇ ಬೇಕು ಎಂದು ಅರಸಿ ಬರುವಂತಾಗುತ್ತದೆ."
      : "Yet their indispensability cannot be suppressed; management and clients ultimately realize missions fail without their direct intervention.",
    tone: "good",
    tagKn: "ಅನಿವಾರ್ಯ ಪ್ರತಿಭೆ",
    tagEn: "Indispensable Competence"
  });

  points.push({
    id: 5,
    text: isKn
      ? "ಆರ್ಥಿಕ ವಾಸ್ತವ: ಕೈಯಲ್ಲಿ ನಗದು ಹಣ (Liquid Cash) ನಿಲ್ಲುವುದು ಸ್ವಲ್ಪ ಕಷ್ಟವಾದರೂ, ಶಾಶ್ವತ ಆಸ್ತಿ, ಮನೆ ಅಥವಾ ಚಿನ್ನಾಭರಣದ ರೂಪದಲ್ಲಿ ಸಂಪತ್ತು ವೃದ್ಧಿಯಾಗುವ ಭಾಗ್ಯವಿದೆ."
      : "Financial reality: Liquid bank cash fluctuates rapidly, yet wealth solidifies enduringly through fixed assets, land, and jewelry.",
    tone: "notice",
    tagKn: "ಆಸ್ತಿ vs ನಗದು",
    tagEn: "Liquid vs Fixed Wealth"
  });

  points.push({
    id: 6,
    text: isKn
      ? "ನಂಬಿಕೆಯಿಂದ ಯಾರಿಗಾದರೂ ಸಾಲ ನೀಡಿದರೆ, ಆ ಹಣ ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಮರಳಿ ಬರುವುದು ಅತ್ಯಂತ ಕಷ್ಟ; ಆದ್ದರಿಂದ ಸ್ನೇಹಿತರು ಅಥವಾ ಸಂಬಂಧಿಕರಿಗೆ ಸಾಲ ನೀಡುವಾಗ ಪರಮ ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ."
      : "Lending money out of emotional sympathy results in chronic delays; strictly avoid underwriting private loans without solid security.",
    tone: "bad",
    tagKn: "ಸಾಲ ನೀಡುವ ಎಚ್ಚರಿಕೆ",
    tagEn: "Unsecured Lending Alert"
  });

  points.push({
    id: 7,
    text: isKn
      ? "ಅನಗತ್ಯ ದುಂದುವೆಚ್ಚಗಳಿಲ್ಲದಿದ್ದರೂ, ಕುಟುಂಬದ ತುರ್ತು ಖರ್ಚುಗಳು ಅಥವಾ ಇತರರ ಜವಾಬ್ದಾರಿಗಳಿಗಾಗಿ ಅನಿರೀಕ್ಷಿತವಾಗಿ ಹಣ ಸೋರಿಹೋಗುವ ಸವಾಲು ಇದೆ."
      : "Not a frivolous spender, yet periodic emergency family outflows prevent liquid reserves from accumulating smoothly.",
    tone: "bad",
    tagKn: "ಅನಿರೀಕ್ಷಿತ ಸೋರಿಕೆ",
    tagEn: "Emergency Outflows"
  });

  points.push({
    id: 8,
    text: isKn
      ? "ಕೈಗೆತ್ತಿಕೊಂಡ ಕೆಲಸಗಳಲ್ಲಿ ಅಪ್ರತಿಮ ನಿಷ್ಠೆ ಹಾಗೂ ಗುಣಮಟ್ಟ ಕಾಪಾಡುವುದರಿಂದ, ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಇವರ ಹೆಸರಿಗೆ ಒಂದು ವಿಶಿಷ್ಟ ಬ್ರಾಂಡ್ ಮೌಲ್ಯ ಲಭಿಸಲಿದೆ."
      : "Flawless work ethics and uncompromising standards establish a formidable personal brand and sterling client reputation.",
    tone: "good",
    tagKn: "ಬ್ರಾಂಡ್ ಗೌರವ",
    tagEn: "Sterling Reputation"
  });

  points.push({
    id: 9,
    text: isKn
      ? "ಪ್ರಸ್ತುತ ಕರ್ಮ ಕ್ಷೇತ್ರದ ಅಸ್ಥಿರತೆ ಅಥವಾ ಬದಲಾವಣೆಯು ಮುಂಬರುವ ದೊಡ್ಡ ಆರ್ಥಿಕ ಉನ್ನತಿಗೆ ಒಂದು ಪ್ರಮುಖ ಪೂರ್ವಸಿದ್ಧತೆಯಾಗಿದೆ."
      : "Ongoing career transitions or friction serve as necessary springboards toward their greatest upcoming commercial elevation.",
    tone: "notice",
    tagKn: "ಉನ್ನತಿಯ ಹಂತ",
    tagEn: "Career Springboard"
  });

  points.push({
    id: 10,
    text: isKn
      ? "ಶ್ರೀ ಲಕ್ಷ್ಮೀ ನಾರಾಯಣ ಪ್ರಾರ್ಥನೆ ಹಾಗೂ ಶುಕ್ರವಾರ ಧನಲಕ್ಷ್ಮೀ ಪೂಜೆಯಿಂದ ವ್ಯಾಪಾರ-ವ್ಯವಹಾರಗಳಲ್ಲಿ ನೂತನ ಧನಾಗಮನದ ಬಾಗಿಲುಗಳು ತೆರೆಯಲಿವೆ."
      : "Devotions to Sri Lakshmi-Narayana and Friday Dhana-Lakshmi prayers unlock multiple streams of legitimate wealth.",
    tone: "good",
    tagKn: "ಧನಲಾಭ ಯೋಗ",
    tagEn: "Dhana Lakshmi Grace"
  });

  points.push({
    id: 11,
    text: isKn
      ? "ಸ್ವಂತ ಪರಿಶ್ರಮದಿಂದಲೇ ಆರ್ಥಿಕ ಸಾಮ್ರಾಜ್ಯ ಕಟ್ಟುವ ಧೀರ ಯೋಗ ಜಾತಕರ ರಕ್ತದಲ್ಲಿದೆ; ಯಾರ ದಯಾ-ದಾಕ್ಷಿಣ್ಯಕ್ಕೂ ಇವರು ಕಾಯಬೇಕಿಲ್ಲ."
      : "Destined to build durable prosperity purely through self-made enterprise and perseverance, beholden to no benefactor.",
    tone: "good",
    tagKn: "ಸ್ವಯಂ ಸಂಪತ್ತು",
    tagEn: "Self-Made Prosperity"
  });

  return points;
}

// -------------------------------------------------------------
// CARD 6: ದಶಾ ತಿರುವು & ಶ್ರೀ ಗೋಕರ್ಣ ಸಿದ್ಧ ಪರಿಹಾರ (Turning Point & Sacred Gokarna Remedy)
// -------------------------------------------------------------
export interface TurningPointOptions {
  runningMaha: string;
  runningBhukti: string;
  remainingMonths: number;
  nextBhukti?: string;
  dashaTimeline: string;
  isKn: boolean;
}

export function buildTurningPointPoints(opts: TurningPointOptions): AstrologerPointItem[] {
  const isKn = opts.isKn;
  const rem = opts.remainingMonths || 6;
  const mahaKn = toKannadaPlanet(opts.runningMaha);
  const bhuktiKn = toKannadaPlanet(opts.runningBhukti);
  const nextKn = opts.nextBhukti ? toKannadaPlanet(opts.nextBhukti) : "ಮುಂದಿನ ಶುಭ ಗ್ರಹ";
  const mahaEn = opts.runningMaha || "Guru";
  const bhuktiEn = opts.runningBhukti || "Shani";
  const nextEn = opts.nextBhukti || "Next Sub-Lord";

  const points: AstrologerPointItem[] = [];

  points.push({
    id: 1,
    text: isKn
      ? `ಪ್ರಸ್ತುತ ವಿಂಶೋತ್ತರಿ ದಶಾ ಚಕ್ರದಲ್ಲಿ '${mahaKn}' ಮಹಾದಶೆಯ '${bhuktiKn}' ಭುಕ್ತಿಯು ಚಾಲ್ತಿಯಲ್ಲಿದೆ.`
      : `Operating under Vimshottari Mahadasha '${mahaEn}' and Antardasha '${bhuktiEn}'.`,
    tone: "normal",
    tagKn: "ದಶಾ ಸ್ಥಿತಿ",
    tagEn: "Active Dasha Cycle"
  });

  points.push({
    id: 2,
    text: isKn
      ? `ಪ್ರಸ್ತುತ ಕಠಿಣ ದಶಾ-ಭುಕ್ತಿಯು ಇನ್ನು ಕೇವಲ ${rem} ತಿಂಗಳುಗಳಲ್ಲಿ ಮುಕ್ತಾಯಗೊಳ್ಳಲಿದ್ದು, ನಿರೀಕ್ಷಿತ ತಿರುವು ಶೀಘ್ರವೇ ಆರಂಭವಾಗಲಿದೆ.`
      : `The ongoing sub-dasha phase concludes in approximately ${rem} months, unlocking the long-awaited turning point window.`,
    tone: "notice",
    tagKn: "ಕಾಲಾವಧಿ ಕೌಂಟ್‌ಡೌನ್",
    tagEn: "Turning Point Countdown"
  });

  points.push({
    id: 3,
    text: isKn
      ? `ಮುಂದಿನ ಭುಕ್ತಿಯು '${nextKn}' ಗ್ರಹದ ಆಳ್ವಿಕೆಗೆ ಒಳಪಡಲಿದ್ದು, ವೃತ್ತಿ ಮತ್ತು ಆರ್ಥಿಕತೆಯಲ್ಲಿ ನೂತನ ಅವಕಾಶಗಳ ಹೆಬ್ಬಾಗಿಲು ತೆರೆಯಲಿದೆ.`
      : `The incoming Antardasha of '${nextEn}' initiates fresh commercial expansion, professional breakthroughs, and relief.`,
    tone: "good",
    tagKn: "ಮುಂದಿನ ಶುಭ ಭುಕ್ತಿ",
    tagEn: "Incoming Sub-Lord Grace"
  });

  points.push({
    id: 4,
    text: isKn
      ? "ದಶಾ ಸಂಧಿಕಾಲದ (Dasha Sandhi) ಅವಧಿಯಲ್ಲಿ ಅವಸರದ ನಿರ್ಧಾರ, ಅನಗತ್ಯ ಹೂಡಿಕೆ ಅಥವಾ ಕೌಟುಂಬಿಕ ವಾಗ್ವಾದಗಳಿಗೆ ಎಡೆಗೊಡದೆ ಶಾಂತಿ ಕಾಪಾಡುವುದು ಕಡ್ಡಾಯ."
      : "Strict vigilance during Dasha Sandhi transition: Defer speculative gambles, major career ruptures, and domestic ego clashes.",
    tone: "bad",
    tagKn: "ಸಂಧಿ ಜಾಗರೂಕತೆ",
    tagEn: "Sandhi Caution"
  });

  points.push({
    id: 5,
    text: isKn
      ? "ಗೋಚಾರ ಶನಿಯ ಪ್ರಭಾವದಿಂದ ಕರ್ತವ್ಯದ ಶ್ರಮ ಹೆಚ್ಚಿದ್ದರೂ, ಆಂತರಿಕ ಪರಿಪಕ್ವತೆ ಹಾಗೂ ಶಾಶ್ವತ ಬುನಾದಿ ನಿರ್ಮಾಣವಾಗುತ್ತಿದೆ."
      : "Transit Saturn enforces rigorous discipline and labor, yet lays the unshakeable foundation for permanent long-term stability.",
    tone: "notice",
    tagKn: "ಗೋಚಾರ ಶನಿ ಬಲ",
    tagEn: "Saturnian Discipline"
  });

  points.push({
    id: 6,
    text: isKn
      ? "ಗೋಚಾರ ಗುರುವಿನ ಶುಭ ದೃಷ್ಟಿಯು ಸದ್ಯದಲ್ಲೇ ಜಾತಕರ ಭಾಗ್ಯ ಸ್ಥಾನ ಅಥವಾ ಕೇಂದ್ರ ಸ್ಥಾನದ ಮೇಲೆ ಪ್ರಭಾವ ಬೀರಿ, ಧರ್ಮ ಕಾರ್ಯಗಳಿಗೆ ಪ್ರೇರೇಪಿಸಲಿದೆ."
      : "Jupiter's transit aspect prepares to illuminate Kendra/Trikona houses, unlocking auspicious events and spiritual fulfillment.",
    tone: "good",
    tagKn: "ಗುರು ಕೃಪೆ",
    tagEn: "Jupiterian Illumination"
  });

  points.push({
    id: 7,
    text: isKn
      ? "ಈ ದಶಾ ತಿರುವಿನ ಕಾಲದಲ್ಲಿ ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಸನ್ನಿಧಾನದಲ್ಲಿ ನವಗ್ರಹ ಶಾಂತಿ & ಮಹಾಮೃತ್ಯುಂಜಯ ಸಂಕಲ್ಪ ನೆರವೇರಿಸುವುದು ಪರಮ ಶ್ರೇಯಸ್ಕರ."
      : "Sponsoring Navagraha Shanti and Maha Mrityunjaya Sankalpa at sacred Gokarna Mahabaleshwara sanctum ensures swift resolution.",
    tone: "good",
    tagKn: "ಗೋಕರ್ಣ ಸಂಕಲ್ಪ",
    tagEn: "Gokarna Sankalpa"
  });

  points.push({
    id: 8,
    text: isKn
      ? "ಶ್ರೀ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಆತ್ಮಲಿಂಗಕ್ಕೆ ಕ್ಷೀರಾಭಿಷೇಕ ಸೇವೆ ಸಮರ್ಪಿಸುವುದರಿಂದ ದೀರ್ಘಕಾಲದ ಮಾನಸಿಕ ತೊಳಲಾಟ ಶಮನಗೊಳ್ಳುತ್ತದೆ."
      : "Milk Abhisheka to the sacred Gokarna Atma Linga dissolves acute karmic friction, restoring profound mental composure.",
    tone: "good",
    tagKn: "ಆತ್ಮಲಿಂಗ ಸೇವೆ",
    tagEn: "Atma Linga Seva"
  });

  points.push({
    id: 9,
    text: isKn
      ? "ದಿನನಿತ್ಯ ಪ್ರಾತಃಕಾಲ ಸೂರ್ಯೋದಯದ ವೇಳೆ ಆದಿತ್ಯ ಹೃದಯ ಸ್ತೋತ್ರ ಅಥವಾ ಈಶ್ವರ ಪಂಚಾಕ್ಷರಿ ಜಪವನ್ನು ಶ್ರದ್ಧೆಯಿಂದ ಪಠಿಸಿ."
      : "Recite Aditya Hridaya Stotra or Shiva Panchakshari Mantra at dawn to revitalize vitality and leadership presence.",
    tone: "good",
    tagKn: "ದೈನಂದಿನ ಆರಾಧನೆ",
    tagEn: "Daily Sadhana"
  });

  points.push({
    id: 10,
    text: isKn
      ? "ಈ ಶುಭ ತಿರುವಿನೊಂದಿಗೆ ಜಾತಕರ ಜೀವನದಲ್ಲಿ ದೀರ್ಘಕಾಲದ ಸಂಕಷ್ಟಗಳು ಕರಗಿ, ಗೌರವ ಹಾಗೂ ಸಂಪತ್ತು ನೆಲೆಗೊಳ್ಳುವುದು ನಿಶ್ಚಿತ."
      : "With this planetary turning point, protracted obstacles dissolve, conferring enduring prosperity, respect, and peace.",
    tone: "good",
    tagKn: "ಭಾಗ್ಯೋದಯ ಭರವಸೆ",
    tagEn: "Destined Breakthrough"
  });

  points.push({
    id: 11,
    text: isKn
      ? "ಶ್ರೀ ಗೋಕರ್ಣ ಕ್ಷೇತ್ರ ಪ್ರಧಾನ ಅರ್ಚಕರಾದ ವೇದಮೂರ್ತಿ ಶ್ರೀರಾಮ್ ಪಂಡಿತ್ (+91 99723 39362) ಅವರ ಆಶೀರ್ವಾದದೊಂದಿಗೆ ಸರ್ವಕಾರ್ಯ ಸಿದ್ಧಿ ಲಭಿಸಲಿ."
      : "Blessed under the auspices of Sri Kshetra Gokarna Chief Priest Vedamurthy Shreeram Pandit (+91 99723 39362).",
    tone: "good",
    tagKn: "ವೇದಮೂರ್ತಿ ಆಶೀರ್ವಾದ",
    tagEn: "Priest Shreeram Pandit Seal"
  });

  return points;
}

export function buildDeterministicFirstSixPoints(
  synthesisData: PanchangaSynthesisOutput,
  session: any,
  isKn: boolean
): FirstSixTalkingPointsStructured {
  const lagnaRashiEn = session?.result?.lagnaRashi?.english || "Aries";
  const moonRashiEn = session?.result?.moonSign?.english || "Aries";
  const moonPlanet = session?.result?.planets?.find((p: any) => p.name === "Moon");
  const saturnPlanet = session?.result?.planets?.find((p: any) => p.name === "Saturn");
  const rahuPlanet = session?.result?.planets?.find((p: any) => p.name === "Rahu");
  const ketuPlanet = session?.result?.planets?.find((p: any) => p.name === "Ketu");
  const marsPlanet = session?.result?.planets?.find((p: any) => p.name === "Mars");
  const jupiterPlanet = session?.result?.planets?.find((p: any) => p.name === "Jupiter");
  const sunPlanet = session?.result?.planets?.find((p: any) => p.name === "Sun");

  const moonNakEn = moonPlanet?.nakshatra?.english || "Ashwini";
  const devoteeName = session?.input?.name || (isKn ? "ಭಕ್ತರೇ" : "Devotee");
  const isFemale = session?.input?.gender === "Female";

  // Calculate devotee age
  let devoteeAge = 30;
  const bDate = session?.birthDateYmd || session?.input?.birthDate;
  if (bDate && bDate.length >= 4) {
    const y = parseInt(bDate.substring(0, 4), 10);
    if (!isNaN(y)) devoteeAge = Math.max(1, new Date().getFullYear() - y);
  }

  const moonHouse = moonPlanet?.house || 1;
  const isDusthanaMoon = [6, 8, 12].includes(moonHouse);

  // Vish Yoga / Punaphoo: Moon with Saturn or Saturn aspecting Moon
  const hasVishYoga = Boolean(
    saturnPlanet && (
      saturnPlanet.house === moonHouse ||
      ((moonHouse - saturnPlanet.house + 12) % 12 + 1 === 3) ||
      ((moonHouse - saturnPlanet.house + 12) % 12 + 1 === 7) ||
      ((moonHouse - saturnPlanet.house + 12) % 12 + 1 === 10)
    )
  );

  // Grahan Yoga: Moon with Rahu or Rahu trine/aspect
  const hasGrahanYoga = Boolean(
    rahuPlanet && (
      rahuPlanet.house === moonHouse ||
      ((moonHouse - rahuPlanet.house + 12) % 12 + 1 === 5) ||
      ((moonHouse - rahuPlanet.house + 12) % 12 + 1 === 7) ||
      ((moonHouse - rahuPlanet.house + 12) % 12 + 1 === 9)
    )
  );

  const hasKetuYoga = Boolean(ketuPlanet && ketuPlanet.house === moonHouse);
  const hasMangalYoga = Boolean(marsPlanet && marsPlanet.house === moonHouse);

  // Gaja Kesari: Jupiter in Kendra (1, 4, 7, 10) from Moon
  const jupDist = jupiterPlanet ? ((jupiterPlanet.house - moonHouse + 12) % 12 + 1) : 0;
  const hasGajakesari = [1, 4, 7, 10].includes(jupDist);

  // Kemadruma Yoga: No planets (except Sun/Rahu/Ketu) in 2nd or 12th from Moon
  const house2FromMoon = (moonHouse % 12) + 1;
  const house12FromMoon = ((moonHouse - 2 + 12) % 12) + 1;
  const hasPlanetsAround = session?.result?.planets?.some((p: any) =>
    !["Sun", "Rahu", "Ketu", "Moon"].includes(p.name) &&
    (p.house === house2FromMoon || p.house === house12FromMoon)
  );
  const isKemadruma = !hasPlanetsAround;

  const dashaTiming = synthesisData.currentDiagnosis?.dashaTiming;
  const runningMaha = dashaTiming?.currentMaha || "Guru";
  const runningBhukti = dashaTiming?.currentBhukti || "Shani";
  const nextBhukti = dashaTiming?.nextBhukti;
  const remainingMonths = dashaTiming?.remainingMonths ?? 6;
  const dashaTimeline = dashaTiming?.timelineKn || "ಮುಂದಿನ ಕೆಲವೇ ತಿಂಗಳುಗಳಲ್ಲಿ";

  const mHouse = session?.result?.maandi?.house || 1;
  const mHouseLord = session?.result?.maandi?.houseLord?.english || "Shani";
  const mHouseLordKn = toKannadaPlanet(mHouseLord);

  const prof = synthesisData?.currentDiagnosis?.accurateProfession;
  const tenthSignKn = prof?.tenthHouseSignKn || "ದಶಮ";
  const tenthLordKn = prof?.primaryPlanetKn || "ಕರ್ಮಾಧಿಪತಿ";
  const amatyakarakaKn = prof?.amatyakarakaPlanetKn || "ಅಮಾತ್ಯಕಾರಕ";
  const amatyakarakaEn = prof?.amatyakarakaPlanetEn || "Amatyakaraka";

  // Card 1: ಆರಂಭ & ಮೂಲ ಪ್ರಕೃತಿ (12 points)
  const card1: AstrologerPointItem[] = buildCoreTemperamentPoints({
    lagnaEn: lagnaRashiEn,
    moonEn: moonRashiEn,
    nakshatraEn: moonNakEn,
    isFemale,
    isKn,
    devoteeName
  });

  // Card 2: ಅಂತರಂಗದ ಗುಪ್ತ ಆತಂಕ & ಚಿಂತೆ (12 points) - 100% Dynamic
  const card2: AstrologerPointItem[] = buildSubconsciousWorryPoints({
    moonSignEn: moonRashiEn,
    moonNakEn,
    moonHouse,
    hasVishYoga,
    hasGrahanYoga,
    hasKetuYoga,
    hasMangalYoga,
    hasGajakesari,
    isDusthanaMoon,
    isKemadruma,
    age: devoteeAge,
    isFemale,
    isKn,
    devoteeName
  });

  // Card 3: 99% ಆದ ಕೆಲಸ ನಿಲ್ಲಿಸುವ 'ಮಾಂದಿ ಕರ್ಮ ಗಂಟು' (11 points) - 100% Dynamic 12 Houses
  const card3: AstrologerPointItem[] = buildMaandiKarmicPoints({
    maandiHouse: mHouse,
    maandiLordKn: mHouseLordKn,
    maandiLordEn: mHouseLord,
    isKn,
    devoteeAge
  });

  // Card 4: ಶಾರೀರಿಕ ಮಚ್ಚೆ ಗುರುತು & ತ್ರಿದೋಷ ಪ್ರಕೃತಿ (11 points) - 100% Dynamic
  const card4: AstrologerPointItem[] = buildAngaLakshanaAndTridoshaPoints({
    lagnaEn: lagnaRashiEn,
    lagnaLordEn: session?.result?.lagnaLord?.english || "Mars",
    marsHouse: marsPlanet?.house,
    sunHouse: sunPlanet?.house,
    moonHouse,
    isKn
  });

  // Card 5: ಕರ್ಮ ಸ್ಥಾನ & ವಾಸ್ತವಿಕ ಆರ್ಥಿಕ ಸ್ಥಿತಿ (11 points) - 100% Dynamic
  const card5: AstrologerPointItem[] = buildKarmaFinancialPoints({
    tenthSignKn,
    tenthLordKn,
    amatyakarakaKn,
    amatyakarakaEn,
    isKn
  });

  // Card 6: ದಶಾ ತಿರುವು & ಶ್ರೀ ಗೋಕರ್ಣ ಸಿದ್ಧ ಪರಿಹಾರ (11 points) - 100% Dynamic
  const card6: AstrologerPointItem[] = buildTurningPointPoints({
    runningMaha,
    runningBhukti,
    remainingMonths,
    nextBhukti,
    dashaTimeline,
    isKn
  });

  return {
    openingIceBreaker: card1,
    hiddenSubconsciousWorry: card2,
    maandiKarmicImpact: card3,
    bodyMarkAndTemperament: card4,
    karmaFinancialReality: card5,
    immediateTurningPoint: card6
  };
}


export function parseOrEnhanceTalkingPoints(
  rawInput: any,
  deterministic?: FirstSixTalkingPointsStructured,
  isKn: boolean = true
): FirstSixTalkingPointsStructured {
  const safeDeterministic: FirstSixTalkingPointsStructured = {
    openingIceBreaker: deterministic?.openingIceBreaker ? [...deterministic.openingIceBreaker] : [],
    hiddenSubconsciousWorry: deterministic?.hiddenSubconsciousWorry ? [...deterministic.hiddenSubconsciousWorry] : [],
    maandiKarmicImpact: deterministic?.maandiKarmicImpact ? [...deterministic.maandiKarmicImpact] : [],
    bodyMarkAndTemperament: deterministic?.bodyMarkAndTemperament ? [...deterministic.bodyMarkAndTemperament] : [],
    karmaFinancialReality: deterministic?.karmaFinancialReality ? [...deterministic.karmaFinancialReality] : [],
    immediateTurningPoint: deterministic?.immediateTurningPoint ? [...deterministic.immediateTurningPoint] : []
  };

  const result: FirstSixTalkingPointsStructured = {
    openingIceBreaker: [...safeDeterministic.openingIceBreaker],
    hiddenSubconsciousWorry: [...safeDeterministic.hiddenSubconsciousWorry],
    maandiKarmicImpact: [...safeDeterministic.maandiKarmicImpact],
    bodyMarkAndTemperament: [...safeDeterministic.bodyMarkAndTemperament],
    karmaFinancialReality: [...safeDeterministic.karmaFinancialReality],
    immediateTurningPoint: [...safeDeterministic.immediateTurningPoint]
  };

  if (!rawInput || typeof rawInput !== "object") {
    return result;
  }

  const keys: (keyof FirstSixTalkingPointsStructured)[] = [
    "openingIceBreaker",
    "hiddenSubconsciousWorry",
    "maandiKarmicImpact",
    "bodyMarkAndTemperament",
    "karmaFinancialReality",
    "immediateTurningPoint"
  ];

  for (const key of keys) {
    const aiArray = rawInput[`${key}Points`] || rawInput[key];
    const baseList = safeDeterministic[key];

    if (Array.isArray(aiArray) && aiArray.length > 0) {
      const parsedPoints: AstrologerPointItem[] = [];
      aiArray.forEach((item: any, idx: number) => {
        let text = "";
        let tone: PointTone = "normal";
        if (typeof item === "string") {
          text = sanitizeAstrologyKannadaText(item.replace(/^(\d+[\.\)]|\*|•|-)\s*/, "").trim());
          tone = classifyAstrologyTextTone(text);
        } else if (item && typeof item === "object") {
          text = sanitizeAstrologyKannadaText(String(item.text || item.point || "").replace(/^(\d+[\.\)]|\*|•|-)\s*/, "").trim());
          const rawTone = String(item.tone || "").toLowerCase();
          if (["good", "bad", "notice", "normal"].includes(rawTone)) {
            tone = rawTone as PointTone;
          } else {
            tone = classifyAstrologyTextTone(text);
          }
        }

        if (text.length >= 15) {
          // STRICT RULE: Section 1 (openingIceBreaker) must NEVER contain technical astrological jargon!
          if (key === "openingIceBreaker") {
            const techKnWords = ["ಲಗ್ನ", "ರಾಶಿ", "ನಕ್ಷತ್ರ", "ಗ್ರಹ", "ಭಾವ", "ಅಧಿಪತಿ", "ದಶಾ", "ಕುಂಡಲಿ"];
            const techEnRegex = /\b(lagna|ascendant|rashi|sign|nakshatra|graha|planet|house|bhava|lord|pada|dasha)\b/i;
            const hasTechJargon = isKn
              ? techKnWords.some((w) => text.includes(w))
              : techEnRegex.test(text);

            if (hasTechJargon) {
              return; // Skip technical item to keep Card 1 100% human-focused
            }
          }

          parsedPoints.push({
            id: parsedPoints.length + 1,
            text,
            tone,
            tagKn: getToneLabel(tone, true),
            tagEn: getToneLabel(tone, false)
          });
        }
      });

      // If AI produced at least 10 valid points, use them
      if (parsedPoints.length >= 10) {
        result[key] = parsedPoints.slice(0, 15);
      } else if (parsedPoints.length > 0) {
        // AI produced some points, pad with remaining deterministic points to guarantee at least 10!
        const existingCount = parsedPoints.length;
        const needed = 10 - existingCount;
        const padding = baseList.slice(0, Math.max(needed, 3)).map((item, pIdx) => ({
          ...item,
          id: existingCount + pIdx + 1
        }));
        result[key] = [...parsedPoints, ...padding];
      }
    } else if (typeof aiArray === "string" && aiArray.trim().length > 60) {
      // If AI returned a big string/paragraph, split it by bullet points, numbers, or sentences
      const lines = aiArray
        .split(/(?:\r?\n)+|(?<=[.!?।॥])\s+(?=[0-9A-Z\u0C80-\u0CFF])/)
        .map((l) => l.replace(/^(\d+[\.\)]|\*|•|-)\s*/, "").trim())
        .filter((l) => l.length >= 20);

      if (lines.length >= 8) {
        const parsedPoints: AstrologerPointItem[] = [];
        lines.slice(0, 15).forEach((text) => {
          const clean = sanitizeAstrologyKannadaText(text);
          if (key === "openingIceBreaker") {
            const techKnWords = ["ಲಗ್ನ", "ರಾಶಿ", "ನಕ್ಷತ್ರ", "ಗ್ರಹ", "ಭಾವ", "ಅಧಿಪತಿ", "ದಶಾ", "ಕುಂಡಲಿ"];
            const techEnRegex = /\b(lagna|ascendant|rashi|sign|nakshatra|graha|planet|house|bhava|lord|pada|dasha)\b/i;
            const hasTech = isKn ? techKnWords.some((w) => clean.includes(w)) : techEnRegex.test(clean);
            if (hasTech) return;
          }
          const tone = classifyAstrologyTextTone(clean);
          parsedPoints.push({
            id: parsedPoints.length + 1,
            text: clean,
            tone,
            tagKn: getToneLabel(tone, true),
            tagEn: getToneLabel(tone, false)
          });
        });

        if (parsedPoints.length >= 10) {
          result[key] = parsedPoints;
        } else {
          const needed = 10 - parsedPoints.length;
          const padding = baseList.slice(0, needed).map((item, pIdx) => ({
            ...item,
            id: parsedPoints.length + pIdx + 1
          }));
          result[key] = [...parsedPoints, ...padding];
        }
      }
    }
  }

  return result;
}
