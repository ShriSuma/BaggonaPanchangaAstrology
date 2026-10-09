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
    "ಕುಂದು", "ಅಪಾರ್ಥ", "ಸಂಕಟ", "ದೌರ್ಬಲ್ಯ", "ಆಲಸ್ಯ", "೯೯%", "99%", "ಕೈತಪ್ಪುವ",
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
export function buildDeterministicFirstSixPoints(
  synthesisData: PanchangaSynthesisOutput,
  session: any,
  isKn: boolean
): FirstSixTalkingPointsStructured {
  const lagnaRashiEn = session?.result?.lagnaRashi?.english || "Aries";
  const lagnaRashiKn = toKannadaRashi(lagnaRashiEn);
  const moonRashiEn = session?.result?.moonSign?.english || "Aries";
  const moonRashiKn = toKannadaRashi(moonRashiEn);
  const moonPlanet = session?.result?.planets?.find((p: any) => p.name === "Moon");
  const moonNakEn = moonPlanet?.nakshatra?.english || "Ashwini";
  const moonNakKn = toKannadaNakshatra(moonNakEn);

  const devoteeName = session?.input?.name || (isKn ? "ಭಕ್ತರೇ" : "Devotee");
  const isFemale = session?.input?.gender === "Female";
  const spouseTerm = isFemale ? (isKn ? "ಪತಿ" : "spouse") : (isKn ? "ಪತ್ನಿ" : "spouse");

  const dashaTiming = synthesisData.currentDiagnosis?.dashaTiming;
  const runningMaha = dashaTiming?.currentMaha || "Guru";
  const runningBhukti = dashaTiming?.currentBhukti || "Shani";
  const remainingMonths = dashaTiming?.remainingMonths ?? 6;
  const dashaTimeline = dashaTiming?.timelineKn || "ಮುಂದಿನ ಕೆಲವೇ ತಿಂಗಳುಗಳಲ್ಲಿ";

  const cls = synthesisData?.currentDiagnosis?.currentLifeSituation;
  const prof = synthesisData?.currentDiagnosis?.accurateProfession;
  const remedies = synthesisData?.prescriptions;
  const catalysts = synthesisData?.destinyCatalysts;

  const gemstoneNameKn = remedies?.gemstoneRing?.primaryGemstoneKn || "ಮಾಣಿಕ್ಯ/ಕನಕ ಪುಷ್ಯರಾಗ";
  const gemstoneWeight = remedies?.gemstoneRing?.caratWeight || "4.25 ಕ್ಯಾರಟ್";
  const gemstoneFingerKn = remedies?.gemstoneRing?.fingerKn || "ಉಂಗುರದ ಬೆರಳು";
  const gemstoneNameEn = remedies?.gemstoneRing?.primaryGemstoneEn || remedies?.gemstoneRing?.primaryGemstoneKn || "Yellow Sapphire / Ruby";
  const gemstoneFingerEn = remedies?.gemstoneRing?.fingerEn || remedies?.gemstoneRing?.fingerKn || "Ring Finger";

  const rudrakshaNameKn = remedies?.rudraksha?.nameKn || "ಪಂಚಮುಖಿ ರುದ್ರಾಕ್ಷಿ";
  const rudrakshaNameEn = remedies?.rudraksha?.nameEn || remedies?.rudraksha?.nameKn || "5-Mukhi Rudraksha";

  const mHouse = session?.result?.maandi?.house || 1;
  const mHouseLord = session?.result?.maandi?.houseLord?.english || "Shani";
  const mHouseLordKn = toKannadaPlanet(mHouseLord);

  // -------------------------------------------------------------
  // Card 1: ಆರಂಭ & ಮೂಲ ಪ್ರಕೃತಿ (Ice-Breaker & Core Temperament - 12 points)
  // 100% Technical-Free, Deeply Personalized Characteristics
  // -------------------------------------------------------------
  const card1: AstrologerPointItem[] = buildCoreTemperamentPoints({
    lagnaEn: lagnaRashiEn,
    moonEn: moonRashiEn,
    nakshatraEn: moonNakEn,
    isFemale,
    isKn,
    devoteeName
  });

  // -------------------------------------------------------------
  // Card 2: ಅಂತರಂಗದ ಗುಪ್ತ ಆತಂಕ & ಚಿಂತೆ (Hidden Subconscious Worry - 11 points)
  // -------------------------------------------------------------
  const card2: AstrologerPointItem[] = isKn
    ? [
        {
          id: 1,
          text: `ಚಂದ್ರನ ನಕ್ಷತ್ರ '${moonNakKn}' ಹಾಗೂ 4ನೇ ಸುಖ ಸ್ಥಾನದ ಸ್ಥಿತಿಯು ಜಾತಕರ ಆಂತರಿಕ ಮಾನಸಿಕ ನೆಮ್ಮದಿಯನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ.`,
          tone: "normal",
          tagKn: "ಮಾನಸಿಕ ಆಧಾರ",
          tagEn: "Mental Anchor"
        },
        {
          id: 2,
          text: `ಹಗಲಿನಲ್ಲಿ ನಗುಮುಖದಿಂದ ಎಲ್ಲರ ಜವಾಬ್ದಾರಿ ನಿಭಾಯಿಸಿದರೂ, ರಾತ್ರಿ ಏಕಾಂತದಲ್ಲಿ ಮನಸ್ಸು ವಿಶ್ರಾಂತಿ ಪಡೆಯದೆ ಭವಿಷ್ಯದ ಬಗ್ಗೆ ಅತಿಯಾಗಿ ಚಿಂತಿಸುತ್ತದೆ.`,
          tone: "bad",
          tagKn: "ರಾತ್ರಿಯ ಅತಿಚಿಂತನೆ",
          tagEn: "Midnight Overthinking"
        },
        {
          id: 3,
          text: `ಕುಟುಂಬದವರಿಗೂ ಅಥವಾ ಆಪ್ತರಿಗೂ ಹೊರೆಯಾಗಬಾರದೆಂಬ ಉದ್ದೇಶದಿಂದ ತನ್ನ ಆಂತರಿಕ ನೋವು, ಆರ್ಥಿಕ ಒತ್ತಡಗಳನ್ನು ಒಳಗೇ ನುಂಗಿಕೊಳ್ಳುವ ಪ್ರವೃತ್ತಿ ಇದೆ.`,
          tone: "bad",
          tagKn: "ಮೌನ ವೇದನೆ",
          tagEn: "Silent Burden"
        },
        {
          id: 4,
          text: `ತಾನು ನಂಬಿದ ಕೆಲವರು ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ ಕೈಕೊಟ್ಟ ಕಹಿ ನೆನಪುಗಳು ಮನಸ್ಸಿನ ಆಳದಲ್ಲಿ ಇನ್ನೂ ಮರೆಯಾಗದೆ ಸೂಕ್ಷ್ಮ ಸಂಶಯ ಉಳಿಸಿದೆ.`,
          tone: "bad",
          tagKn: "ವಿಶ್ವಾಸಘಾತದ ಗಾಯ",
          tagEn: "Past Betrayal Scar"
        },
        {
          id: 5,
          text: `ಆರ್ಥಿಕ ಭದ್ರತೆಯ ವಿಷಯದಲ್ಲಿ ಸದಾ ಒಂದು ಅನಿಶ್ಚಿತತೆಯ ಭಯ ಕಾಡುತ್ತಿದ್ದು, ನಿರೀಕ್ಷಿತ ಹಣ ಕೈಸೇರುವವರೆಗೂ ಮನಸ್ಸಿನಲ್ಲಿ ದವದವಿಕೆ ಇರುತ್ತದೆ.`,
          tone: "notice",
          tagKn: "ಆರ್ಥಿಕ ಅನಿಶ್ಚಿತತೆ",
          tagEn: "Financial Vulnerability"
        },
        {
          id: 6,
          text: `ಯಾವುದೇ ಕೆಲಸವು 100% ಪರಿಪೂರ್ಣವಾಗಿ ಮುಗಿಯಬೇಕೆಂಬ ಪರಿಪೂರ್ಣತಾವಾದದ (Perfectionism) ಒತ್ತಡದಿಂದ ತಾನೇ ತನಗೆ ಅತಿಯಾದ ಆತಂಕ ತಂದುಕೊಳ್ಳುತ್ತಾರೆ.`,
          tone: "notice",
          tagKn: "ಪರಿಪೂರ್ಣತೆಯ ಒತ್ತಡ",
          tagEn: "Perfectionist Anxiety"
        },
        {
          id: 7,
          text: `ಎಷ್ಟೇ ಆಂತರಿಕ ಬಿರುಗಾಳಿ ಎದ್ದರೂ, ಮುಖದಲ್ಲಿ ಸಮಚಿತ್ತ ಕಾಪಾಡಿಕೊಂಡು ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುವ ಅದ್ಭುತ ಸಹನಶಕ್ತಿ ಜಾತಕರಲ್ಲಿದೆ.`,
          tone: "good",
          tagKn: "ಅಂತಃಸತ್ವ",
          tagEn: "Emotional Endurance"
        },
        {
          id: 8,
          text: `ಹೊಟ್ಟೆಯಲ್ಲಿ ಆಮ್ಲೀಯತೆ (Acidity), ತಲೆನೋವು ಅಥವಾ ನಿದ್ರಾಭಂಗದಂತಹ ಲಕ್ಷಣಗಳು ಜಾತಕರ ಮಾನಸಿಕ ಒತ್ತಡದ ಬಾಹ್ಯ ಪ್ರತಿಫಲನಗಳಾಗಿವೆ.`,
          tone: "bad",
          tagKn: "ದೈಹಿಕ ಒತ್ತಡದ ನೆರಳು",
          tagEn: "Somatic Stress"
        },
        {
          id: 9,
          text: `ಮನಸ್ಸನ್ನು ಪ್ರಶಾಂತಗೊಳಿಸಲು ಪ್ರಕೃತಿ, ದೇವಸ್ಥಾನ ಅಥವಾ ಏಕಾಂತ ಧ್ಯಾನದ ವಾತಾವರಣವು ಜಾತಕರಿಗೆ ಅತೀವ ಶಕ್ತಿಯನ್ನು ನೀಡುತ್ತದೆ.`,
          tone: "good",
          tagKn: "ಏಕಾಂತ ಚೇತರಿಕೆ",
          tagEn: "Solitude Rejuvenation"
        },
        {
          id: 10,
          text: `ಮುಂಬರುವ ಶುಭ ದಶಾ ಬದಲಾವಣೆಯಿಂದ ಈ ಅಂತರಂಗದ ಆತಂಕದ ಮೋಡಗಳು ಕರಗಿ, ಆಂತರಿಕ ಪ್ರಶಾಂತತೆ ಮರುಕಳಿಸುವುದು ನಿಶ್ಚಿತ.`,
          tone: "notice",
          tagKn: "ಶಾಂತಿ ಪ್ರವೇಶ",
          tagEn: "Upcoming Peace Window"
        },
        {
          id: 11,
          text: `ಶ್ರೀ ಶಿವ ಪಂಚಾಕ್ಷರೀ ಜಪ ಹಾಗೂ ಕುಲದೇವತಾ ಪ್ರಾರ್ಥನೆಯಿಂದ ಮನಸ್ಸಿನ ಅಧೀರತೆ ದೂರವಾಗಿ, ನವೀನ ಆತ್ಮವಿಶ್ವಾಸ ನೆಲೆಗೊಳ್ಳಲಿದೆ.`,
          tone: "good",
          tagKn: "ದೈವ ರಕ್ಷಣೆ",
          tagEn: "Divine Mental Shield"
        }
      ]
    : [
        {
          id: 1,
          text: `Chandra's constellation '${moonNakEn}' and 4th house sukhadhipati govern the internal emotional foundation.`,
          tone: "normal",
          tagKn: "Mental Anchor",
          tagEn: "Mental Anchor"
        },
        {
          id: 2,
          text: `Presents a cheerful, composed facade by day, yet battles nocturnal racing thoughts regarding upcoming liabilities.`,
          tone: "bad",
          tagKn: "Midnight Overthinking",
          tagEn: "Midnight Overthinking"
        },
        {
          id: 3,
          text: `Habitual internalization of financial and familial burdens to protect loved ones from worrying, causing internal fatigue.`,
          tone: "bad",
          tagKn: "Silent Burden",
          tagEn: "Silent Burden"
        },
        {
          id: 4,
          text: `Lingering emotional scars from past instances where trusted associates backed out unexpectedly right when needed most.`,
          tone: "bad",
          tagKn: "Past Betrayal Scar",
          tagEn: "Past Betrayal Scar"
        },
        {
          id: 5,
          text: `Subconscious fear of sudden liquidity crunches, generating restlessness until settlements are credited to the bank.`,
          tone: "notice",
          tagKn: "Financial Vulnerability",
          tagEn: "Financial Vulnerability"
        },
        {
          id: 6,
          text: `Self-imposed perfectionist anxiety, feeling agitated when milestones achieve only 90% rather than flawless 100%.`,
          tone: "notice",
          tagKn: "Perfectionist Anxiety",
          tagEn: "Perfectionist Anxiety"
        },
        {
          id: 7,
          text: `Rare internal endurance capable of absorbing immense private shocks without crumbling or neglecting outward duty.`,
          tone: "good",
          tagKn: "Emotional Endurance",
          tagEn: "Emotional Endurance"
        },
        {
          id: 8,
          text: `Physical manifestation of stress through erratic sleep cycles, stomach acidity, or tight neck/shoulder knots.`,
          tone: "bad",
          tagKn: "Somatic Stress",
          tagEn: "Somatic Stress"
        },
        {
          id: 9,
          text: `Spiritual sanctuaries, temple courtyards, and silent walks in nature act as immediate psychic remedies for the native.`,
          tone: "good",
          tagKn: "Solitude Rejuvenation",
          tagEn: "Solitude Rejuvenation"
        },
        {
          id: 10,
          text: `Imminent sub-dasha transition is scheduled to dissolve these midnight anxieties, restoring baseline serenity.`,
          tone: "notice",
          tagKn: "Upcoming Peace Window",
          tagEn: "Upcoming Peace Window"
        },
        {
          id: 11,
          text: `Devotional chanting of Shiva Panchakshari and ancestral sankalpa shields the psyche against all phantom terrors.`,
          tone: "good",
          tagKn: "Divine Mental Shield",
          tagEn: "Divine Mental Shield"
        }
      ];

  // -------------------------------------------------------------
  // Card 3: 99% ಆದ ಕೆಲಸ ನಿಲ್ಲಿಸುವ 'ಮಾಂದಿ ಕರ್ಮ ಗಂಟು' (Maandi Karma Knot - 11 points)
  // -------------------------------------------------------------
  const card3: AstrologerPointItem[] = isKn
    ? [
        {
          id: 1,
          text: `ಶನಿಯ ಅದೃಶ್ಯ ಛಾಯಾ ಪುತ್ರನಾದ 'ಮಾಂದಿ' (ಗುಳಿಕ) ಗ್ರಹವು ${mHouse}ನೇ ಭಾವದಲ್ಲಿದ್ದು, ಅಧಿಪತಿ ${mHouseLordKn} ಪ್ರಭಾವದಲ್ಲಿದ್ದಾನೆ.`,
          tone: "normal",
          tagKn: "ಮಾಂದಿ ಸ್ಥಾನ ಸತ್ಯ",
          tagEn: "Maandi Alignment"
        },
        {
          id: 2,
          text: `ಪ್ರಮುಖ ಕಾರ್ಯಗಳು ಆರಂಭದಲ್ಲಿ ಶೇಕಡಾ 50%, 80%, 90% ಮತ್ತು 99% ರಷ್ಟು ಅತ್ಯಂತ ಸುಲಭವಾಗಿ ಮುನ್ನಡೆದು ಅಂತಿಮ ಕ್ಷಣಕ್ಕೆ ತಲುಪುತ್ತವೆ.`,
          tone: "normal",
          tagKn: "ಆರಂಭಿಕ ಪ್ರಗತಿ",
          tagEn: "Initial Momentum"
        },
        {
          id: 3,
          text: `ಇನ್ನೇನು ನಾಳೆ ಕೆಲಸ ಮುಗಿದು ಫಲ ಸಿಗಬೇಕು ಅನ್ನುವಾಗಲೇ, ಅಂತಿಮ ಸಹಿ ಬೀಳುವ ವೇಳೆ ಅಥವಾ ಹಣ ಬಿಡುಗಡೆಯ ಮುನ್ನಾದಿನ ಕೆಲಸ ಹಠಾತ್ ಸ್ಥಗಿತಗೊಳ್ಳುತ್ತದೆ!`,
          tone: "bad",
          tagKn: "೯೯% ಗಂಟು ಸ್ಫೋಟ",
          tagEn: "99% Stall Trigger"
        },
        {
          id: 4,
          text: `'ಕೈಯಿಗೆ ಬಂದ ತುತ್ತು ಬಾಯಿಗೆ ಬರಲಿಲ್ಲ' ಎಂಬಂತೆ, ಅತ್ಯಂತ ಕ್ಷುಲ್ಲಕ ತಾಂತ್ರಿಕ ನೆಪ ಅಥವಾ ಮೂರನೆಯವರ ಹಸ್ತಕ್ಷೇಪದಿಂದ ಕೆಲಸ ತಿಂಗಳುಗಟ್ಟಲೆ ಎಳೆಯುತ್ತದೆ.`,
          tone: "bad",
          tagKn: "ಕೊನೆಯ ಮೈಲಿ ವಿಳಂಬ",
          tagEn: "Last-Mile Agony"
        },
        {
          id: 5,
          text: `ಪ್ರಾಮಾಣಿಕವಾಗಿ ಬೆವರು ಸುರಿಸಿ ದುಡಿದರೂ, ಅಂತಿಮ ಶ್ರೇಯಸ್ಸು ಅಥವಾ ಹಕ್ಕು ತಲುಪುವಾಗ ಅನಗತ್ಯ ತಡೆಗೋಡೆಗಳು ಎದುರಾಗುವುದು ಇದರ ನೈಜ ಲಕ್ಷಣ.`,
          tone: "bad",
          tagKn: "ಶ್ರಮಕ್ಕೆ ತಡೆ",
          tagEn: "Unearned Obstacles"
        },
        {
          id: 6,
          text: `ಆಸ್ತಿ ನೋಂದಣಿ, ಸಾಲ ಮಂಜೂರಾತಿ, ಸರ್ಕಾರಿ ಪರವಾನಗಿ ಅಥವಾ ಪ್ರಮೋಷನ್ ಕಡತಗಳು ಅಂತಿಮ ಟೇಬಲ್‌ನಲ್ಲಿ ಕಾರಣವಿಲ್ಲದೆ ಕಾಯುವಂತಾಗುತ್ತದೆ.`,
          tone: "notice",
          tagKn: "ಕಾಗದಪತ್ರಗಳ ವಿಳಂಬ",
          tagEn: "Bureaucratic Deadlock"
        },
        {
          id: 7,
          text: `ಆದರೆ ಈ ಮಾಂದಿ ಪ್ರಭಾವವು ವ್ಯಕ್ತಿಯ ತಾಳ್ಮೆ ಹಾಗೂ ಧರ್ಮನಿಷ್ಠೆಯನ್ನು ಪರೀಕ್ಷಿಸುವ ಒಂದು ಸೂಕ್ಷ್ಮ ಪೂರ್ವಾರ್ಜಿತ ಕರ್ಮ ಪರೀಕ್ಷೆಯಾಗಿದೆ.`,
          tone: "notice",
          tagKn: "ಕರ್ಮ ಪರೀಕ್ಷೆ",
          tagEn: "Karmic Crucible"
        },
        {
          id: 8,
          text: `ಸತತ ಪರಿಶ್ರಮ ಹಾಗೂ ಹಠ ಬಿಡದ ಪ್ರಯತ್ನದಿಂದ ಅಂತಿಮವಾಗಿ ವಿಜಯ ಸಿಕ್ಕೇ ಸಿಗುತ್ತದೆ; ಮಾಂದಿ ವಿಳಂಬ ಮಾಡಬಲ್ಲನೇ ಹೊರತು ಯಶಸ್ಸನ್ನು ಶಾಶ್ವತವಾಗಿ ಕಸಿದುಕೊಳ್ಳಲಾರ.`,
          tone: "good",
          tagKn: "ಅಂತಿಮ ಜಯ",
          tagEn: "Eventual Triumph"
        },
        {
          id: 9,
          text: `ಈ ಅಂತಿಮ 1% ಕರ್ಮ ಗಂಟನ್ನು ಕರಗಿಸಲು ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸನ್ನಿಧಾನದಲ್ಲಿ 'ಮಾಂದಿ-ಶನಿ ಶಾಂತಿ ಸಂಕಲ್ಪ' ಅತ್ಯಂತ ಫಲಪ್ರದ.`,
          tone: "good",
          tagKn: "ಗೋಕರ್ಣ ಶಾಂತಿ",
          tagEn: "Gokarna Shanti"
        },
        {
          id: 10,
          text: `ದಿನನಿತ್ಯ ಪ್ರಾತಃಕಾಲ 'ಓಂ ಮಂದಪುತ್ರಾಯ ವಿದ್ಮಹೇ ಮೃತ್ಯುರೂಪಾಯ ಧೀಮಹಿ ತನ್ನೋ ಮಾಂದಿಃ ಪ್ರಚೋದಯಾತ್' ಮಂತ್ರವನ್ನು 11 ಬಾರಿ ಜಪಿಸುವುದು ಮಹತ್ವದ ನಿಯಮ.`,
          tone: "notice",
          tagKn: "ದೈನಂದಿನ ಜಪ",
          tagEn: "Daily Mantra Shield"
        },
        {
          id: 11,
          text: `ಈ ಶಾಸ್ತ್ರೋಕ್ತ ಪರಿಹಾರದಿಂದ ಕಾರ್ಯಗಳಲ್ಲಿನ ನಿಗೂಢ ವಿಘ್ನಗಳು ನಿವಾರಣೆಯಾಗಿ, ಬಾಕಿ ಉಳಿದ ಎಲ್ಲಾ ಕೆಲಸಗಳು ಶೀಘ್ರವಾಗಿ ಮುಕ್ತಾಯ ಕಾಣಲಿವೆ.`,
          tone: "good",
          tagKn: "ಕಾರ್ಯ ಸಿದ್ಧಿ ಯೋಗ",
          tagEn: "Hurdle Dissolution"
        }
      ]
    : [
        {
          id: 1,
          text: `Saturn's subtle shadow satellite Maandi (Gulika) is posited in House ${mHouse} under dispositor ${mHouseLord}.`,
          tone: "normal",
          tagKn: "Maandi Alignment",
          tagEn: "Maandi Alignment"
        },
        {
          id: 2,
          text: `Projects gather rapid speed through 50%, 80%, 90%, and 99% with smooth cooperation and high optimism.`,
          tone: "normal",
          tagKn: "Initial Momentum",
          tagEn: "Initial Momentum"
        },
        {
          id: 3,
          text: `Right when the final signature, loan credit, or transfer order is due tomorrow, an abrupt impasse paralyzes execution!`,
          tone: "bad",
          tagKn: "99% Stall Trigger",
          tagEn: "99% Stall Trigger"
        },
        {
          id: 4,
          text: `The classic 'morsel reached the hand but missed the mouth' curse, where trivial clerical excuses stall outcomes for months.`,
          tone: "bad",
          tagKn: "Last-Mile Agony",
          tagEn: "Last-Mile Agony"
        },
        {
          id: 5,
          text: `Unjust exhaustion where the native pours 100% genuine effort only to see rewards entangled in bureaucratic red tape.`,
          tone: "bad",
          tagKn: "Unearned Obstacles",
          tagEn: "Unearned Obstacles"
        },
        {
          id: 6,
          text: `Particularly affects property registrations, sanction letters, and promotions at the final signatory desk.`,
          tone: "notice",
          tagKn: "Bureaucratic Deadlock",
          tagEn: "Bureaucratic Deadlock"
        },
        {
          id: 7,
          text: `This obstruction serves as a karmic crucible testing ethical stamina before conferring irreversible elevation.`,
          tone: "notice",
          tagKn: "Karmic Crucible",
          tagEn: "Karmic Crucible"
        },
        {
          id: 8,
          text: `Maandi can delay and frustrate, but can NEVER permanently deny fruits to a resilient, principled seeker.`,
          tone: "good",
          tagKn: "Eventual Triumph",
          tagEn: "Eventual Triumph"
        },
        {
          id: 9,
          text: `Sponsoring a dedicated Maandi-Shani Shanti Sankalpa at sacred Gokarna Mahabaleshwara Kshetra permanently snaps this ancestral knot.`,
          tone: "good",
          tagKn: "Gokarna Shanti",
          tagEn: "Gokarna Shanti"
        },
        {
          id: 10,
          text: `Mandatory daily recitation of the Maandi Gayatri (11 repetitions) neutralizes negative eye-casting (drishti) and delays.`,
          tone: "notice",
          tagKn: "Daily Mantra Shield",
          tagEn: "Daily Mantra Shield"
        },
        {
          id: 11,
          text: `Post-remedy, stalled files and frozen financial settlements experience accelerated breakthrough resolution.`,
          tone: "good",
          tagKn: "Hurdle Dissolution",
          tagEn: "Hurdle Dissolution"
        }
      ];

  // -------------------------------------------------------------
  // Card 4: ಶಾರೀರಿಕ ಮಚ್ಚೆ ಗುರುತು & ತ್ರಿದೋಷ ಪ್ರಕೃತಿ (Physical Sign & Tridosha - 11 points)
  // -------------------------------------------------------------
  const card4: AstrologerPointItem[] = isKn
    ? [
        {
          id: 1,
          text: `ಬೃಹತ್ ಜಾತಕ ಅಧ್ಯಾಯ 25ರ ಅಂಗ ಲಕ್ಷಣ ಶಾಸ್ತ್ರದ ಪ್ರಕಾರ, ಲಗ್ನಾಧಿಪತಿಯ ಪ್ರಭಾವದಿಂದ ಶರೀರದಲ್ಲಿ ವಿಶಿಷ್ಟ ಹುಟ್ಟು ಗುರುತು ನಿರ್ಧಾರವಾಗುತ್ತದೆ.`,
          tone: "normal",
          tagKn: "ಶಾಸ್ತ್ರ ಪ್ರಮಾಣ",
          tagEn: "Classical Sutra"
        },
        {
          id: 2,
          text: `ಜಾತಕರ ದೇಹದ ಕುತ್ತಿಗೆ, ಭುಜ, ಎದೆಯ ಪಕ್ಕೆಲುಬು ಅಥವಾ ಮುಖಭಾಗದಲ್ಲಿ ಸ್ಪಷ್ಟವಾದ ನೈಸರ್ಗಿಕ ಮಚ್ಚೆ ಅಥವಾ ಹುಟ್ಟು ಕಲೆಯ ಗುರುತು ಇರುತ್ತದೆ.`,
          tone: "good",
          tagKn: "ಅಂಗ ಲಕ್ಷಣ ಮುದ್ರೆ",
          tagEn: "Distinct Birthmark"
        },
        {
          id: 3,
          text: `ಲಗ್ನಾಧಿಪತಿಯ ಬೆಸ/ಸಮ ರಾಶಿ ಸ್ಥಿತಿಯಂತೆ ಈ ಮಂಗಳಕರ ಗುರುತು ಶರೀರದ ಬಲಭಾಗ ಅಥವಾ ಎಡಭಾಗದಲ್ಲಿ ಎದ್ದುಕಾಣುವಂತೆ ಇರುತ್ತದೆ.`,
          tone: "normal",
          tagKn: "ಶರೀರದ ದಿಕ್ಕು",
          tagEn: "Body Side"
        },
        {
          id: 4,
          text: `ಈ ಶಾರೀರಿಕ ಗುರುತು ಜಾತಕದ ನಿಖರತೆ ಹಾಗೂ ಕುಂಡಲಿಯ ಜನ್ಮ ಸಮಯದ ಸತ್ಯತೆಯನ್ನು 100% ದೃಢೀಕರಿಸುವ ಪ್ರಾಚೀನ ಪರೀಕ್ಷೆಯಾಗಿದೆ.`,
          tone: "good",
          tagKn: "ಕುಂಡಲಿ ಸತ್ಯ ದೃಢೀಕರಣ",
          tagEn: "Chart Verification"
        },
        {
          id: 5,
          text: `ಆಯುರ್ವೇದ ತ್ರಿದೋಷ ಸಿದ್ಧಾಂತದಂತೆ ಜಾತಕರಲ್ಲಿ 'ವಾತ-ಪಿತ್ತ' ಅಥವಾ 'ಪಿತ್ತ-ಕಫ' ಪ್ರಕೃತಿಯ ಉಷ್ಣಾಂಶದ ಸಮತೋಲನವಿರುತ್ತದೆ.`,
          tone: "normal",
          tagKn: "ತ್ರಿದೋಷ ಪ್ರಕೃತಿ",
          tagEn: "Metabolic Profile"
        },
        {
          id: 6,
          text: `ಮಾನಸಿಕ ಒತ್ತಡ ಅಥವಾ ಅತಿಯಾದ ಆತಂಕ ಎದುರಾದಾಗ ಶರೀರದಲ್ಲಿ ಹಠಾತ್ ಉಷ್ಣಾಂಶ ಏರಿಕೆ, ಅಸಿಡಿಟಿ ಅಥವಾ ಕಣ್ಣಿನ ಉರಿ ಕಾಣಿಸಿಕೊಳ್ಳಬಹುದು.`,
          tone: "bad",
          tagKn: "ಉಷ್ಣ ವಿಕೋಪ",
          tagEn: "Pitta Heat Surge"
        },
        {
          id: 7,
          text: `ಜೀರ್ಣಾಂಗ ಕ್ರಿಯೆಯಲ್ಲಿ (ಜಠರಾಗ್ನಿ) ಏರುಪೇರಿದ್ದು, ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಊಟ ಮಾಡದಿದ್ದರೆ ತಲೆನೋವು ಅಥವಾ ಆಯಾಸ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ.`,
          tone: "bad",
          tagKn: "ಜಠರಾಗ್ನಿ ಸೂಕ್ಷ್ಮತೆ",
          tagEn: "Digestive Sensitivity"
        },
        {
          id: 8,
          text: `ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಎದ್ದ ತಕ್ಷಣ ಉಗುರುಬೆಚ್ಚಗಿನ ನೀರು ಸೇವಿಸುವುದು ಹಾಗೂ ಕರಿದ-ಖಾರದ ಪದಾರ್ಥಗಳ ಮಿತ ಬಳಕೆ ಆರೋಗ್ಯಕ್ಕೆ ಅತ್ಯಗತ್ಯ.`,
          tone: "notice",
          tagKn: "ದೈನಂದಿನ ಆಹಾರ ನಿಯಮ",
          tagEn: "Dietary Regimen"
        },
        {
          id: 9,
          text: `ಶರೀರದಲ್ಲಿ ಅದ್ಭುತ ರೋಗನಿರೋಧಕ ಶಕ್ತಿ ಹಾಗೂ ನೈಸರ್ಗಿಕ ಚೇತರಿಕಾ ಬಲವಿದ್ದು, ಸೂಕ್ತ ವಿಶ್ರಾಂತಿ ಸಿಕ್ಕರೆ ಶೀಘ್ರವಾಗಿ ಚೇತರಿಸಿಕೊಳ್ಳುತ್ತಾರೆ.`,
          tone: "good",
          tagKn: "ನೈಸರ್ಗಿಕ ಚೇತರಿಕೆ",
          tagEn: "Natural Recovery"
        },
        {
          id: 10,
          text: `ರಾತ್ರಿ ಮಲಗುವ ಮುನ್ನ ಮೊಬೈಲ್/ಸ್ಕ್ರೀನ್ ದೂರವಿಟ್ಟು, ಪಾದಗಳನ್ನು ತೊಳೆದು ಮಲಗುವುದರಿಂದ ಪ್ರಶಾಂತ ನಿದ್ರೆ ಪ್ರಾಪ್ತಿಯಾಗುತ್ತದೆ.`,
          tone: "notice",
          tagKn: "ನಿದ್ರಾ ಸಂರಕ್ಷಣೆ",
          tagEn: "Sleep Hygiene"
        },
        {
          id: 11,
          text: `ಆಯುಷ್ಯ ಸ್ಥಾನವು ಶುಭ ರಕ್ಷಣೆಯಲ್ಲಿದ್ದು, ಸಾತ್ವಿಕ ಜೀವನಶೈಲಿಯಿಂದ ದೀರ್ಘಾಯುಷ್ಯ ಹಾಗೂ ಉತ್ತಮ ದೈಹಿಕ ತೇಜಸ್ಸು ಪ್ರಾಪ್ತವಾಗಲಿದೆ.`,
          tone: "good",
          tagKn: "ಆಯುಷ್ಯ ರಕ್ಷಣೆ",
          tagEn: "Longevity Grace"
        }
      ]
    : [
        {
          id: 1,
          text: `Per Brihat Jataka Chapter 25 (Anga Lakshana), ascendant dignity imprints a permanent physical marker confirming birth authenticity.`,
          tone: "normal",
          tagKn: "Classical Sutra",
          tagEn: "Classical Sutra"
        },
        {
          id: 2,
          text: `Native carries a distinct natural mole, beauty mark, or birth sign situated around the neck, collarbone, chest, or facial zone.`,
          tone: "good",
          tagKn: "Distinct Birthmark",
          tagEn: "Distinct Birthmark"
        },
        {
          id: 3,
          text: `Governed by odd/even house lordship, this prominent mark aligns reliably along the right or left anatomical meridian.`,
          tone: "normal",
          tagKn: "Body Side",
          tagEn: "Body Side"
        },
        {
          id: 4,
          text: `This classical signature serves as concrete physical validation that planetary degrees align 100% with the birth chart.`,
          tone: "good",
          tagKn: "Chart Verification",
          tagEn: "Chart Verification"
        },
        {
          id: 5,
          text: `Tridosha constitution reflects dynamic Vata-Pitta or Pitta-Kapha metabolism with fluctuating internal core body heat.`,
          tone: "normal",
          tagKn: "Metabolic Profile",
          tagEn: "Metabolic Profile"
        },
        {
          id: 6,
          text: `Under intense emotional deadlines, sudden surges of metabolic Pitta manifest as stomach acidity, dry throat, or eye fatigue.`,
          tone: "bad",
          tagKn: "Pitta Heat Surge",
          tagEn: "Pitta Heat Surge"
        },
        {
          id: 7,
          text: `Digestive fire (Jatharagni) is sensitive to erratic meal timings, triggering low-grade headaches if lunch is skipped.`,
          tone: "bad",
          tagKn: "Digestive Sensitivity",
          tagEn: "Digestive Sensitivity"
        },
        {
          id: 8,
          text: `Hydrating with lukewarm water first thing at dawn and moderating spicy/sour oily stimulants is strictly advised.`,
          tone: "notice",
          tagKn: "Dietary Regimen",
          tagEn: "Dietary Regimen"
        },
        {
          id: 9,
          text: `Inherent vital reserve (Ojas) rebounds rapidly once proper circadian sleep and clean hydration are restored.`,
          tone: "good",
          tagKn: "Natural Recovery",
          tagEn: "Natural Recovery"
        },
        {
          id: 10,
          text: `Disconnecting from screens 45 minutes prior to sleep preserves optical prana and prevents restless tossing.`,
          tone: "notice",
          tagKn: "Sleep Hygiene",
          tagEn: "Sleep Hygiene"
        },
        {
          id: 11,
          text: `Benefic planetary aspects shelter the longevity house, ensuring sustained physical vitality and radiant aura.`,
          tone: "good",
          tagKn: "Longevity Grace",
          tagEn: "Longevity Grace"
        }
      ];

  // -------------------------------------------------------------
  // Card 5: ಕರ್ಮ ಸ್ಥಾನ & ವಾಸ್ತವಿಕ ಆರ್ಥಿಕ ಸ್ಥಿತಿ (Karma & Financial Reality - 11 points)
  // -------------------------------------------------------------
  const card5: AstrologerPointItem[] = isKn
    ? [
        {
          id: 1,
          text: `10ನೇ ಕರ್ಮ ಸ್ಥಾನ ಹಾಗೂ ಅಮಾತ್ಯಕಾರಕ ಗ್ರಹದ ಪ್ರಭಾವವು ಜಾತಕರ ವೃತ್ತಿ ಗೌರವ ಹಾಗೂ ಕಾರ್ಯಕ್ಷೇತ್ರದ ಯಶಸ್ಸನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ.`,
          tone: "normal",
          tagKn: "ಕರ್ಮ ಸ್ಥಾನ ಸತ್ಯ",
          tagEn: "10th House Foundation"
        },
        {
          id: 2,
          text: `ಜಾತಕರು ಆಡಳಿತ, ನಿರ್ವಹಣೆ, ಸಲಹಾ ರಂಗ, ತಂತ್ರಜ್ಞಾನ, ಕಲೆ ಅಥವಾ ಕಾರ್ಯತಂತ್ರದ ಪ್ರಮುಖ ರಂಗಗಳಲ್ಲಿ ಅತ್ಯುನ್ನತ ಯಶಸ್ಸು ಕಾಣುವ ಯೋಗವಿದೆ.`,
          tone: "good",
          tagKn: "ಪ್ರಮುಖ ವೃತ್ತಿ ರಂಗ",
          tagEn: "Prime Career Sector"
        },
        {
          id: 3,
          text: `ಕಾರ್ಯಕ್ಷೇತ್ರದಲ್ಲಿ ಪ್ರಾಮಾಣಿಕತೆ ಹಾಗೂ ಶಿಸ್ತಿಗೆ ಮೊದಲ ಆದ್ಯತೆ ನೀಡುವ ಜಾತಕರಿಗೆ, ಚಾಡಿ ಹೇಳುವುದು, ಕಚೇರಿ ರಾಜಕೀಯ ಅಥವಾ ಮುಖಸ್ತುತಿ ಕಂಡರೆ ಅಸಹ್ಯ.`,
          tone: "good",
          tagKn: "ವೃತ್ತಿ ಸತ್ಯನಿಷ್ಠೆ",
          tagEn: "Workplace Ethics"
        },
        {
          id: 4,
          text: `ತಾನು ಬೆವರು ಸುರಿಸಿ ಮಾಡಿದ ಕೆಲಸಕ್ಕೆ ಇತರರು ಕ್ರೆಡಿಟ್ ಪಡೆದುಕೊಳ್ಳುವ ಅಥವಾ ತನಗೆ ಸಲ್ಲಬೇಕಾದ ಮನ್ನಣೆ ವಿಳಂಬವಾಗುವ ಕಹಿ ಅನುಭವ ಹಲವು ಬಾರಿ ಆಗಿದೆ.`,
          tone: "bad",
          tagKn: "ಶ್ರೇಯಸ್ಸು ಕಳವು",
          tagEn: "Uncredited Labor"
        },
        {
          id: 5,
          text: `ಕೈಗೆ ಬಂದ ನಗದು ಹಣವು ತಕ್ಷಣವೇ ಕೌಟುಂಬಿಕ ಜವಾಬ್ದಾರಿ, ಸ್ಥಿರಾಸ್ತಿ ಅಥವಾ ಸಾಲ ತೀರುವಳಿಯಲ್ಲಿ ಲಾಕ್ ಆಗಿ, ಕೈಯಲ್ಲಿ ಲಿಕ್ವಿಡ್ ಕ್ಯಾಶ್ ಕೊರತೆ ಕಾಣಿಸುತ್ತದೆ.`,
          tone: "bad",
          tagKn: "ದ್ರವ್ಯ ಹಣದ ಕೊರತೆ",
          tagEn: "Cash Flow Lockup"
        },
        {
          id: 6,
          text: `ಹಣಕಾಸಿನ ಹರಿವು ನಿರಂತರವಾಗಿದ್ದರೂ, ಕೈಯಲ್ಲಿ ಉಳಿತಾಯದ ನಿಧಿ ಹೆಚ್ಚಾಗುವ ಬದಲು ಅನಿರೀಕ್ಷಿತ ಅಗತ್ಯಗಳಿಗೆ ವ್ಯಯವಾಗುವ ಪರಿಸ್ಥಿತಿ ಇದೆ.`,
          tone: "notice",
          tagKn: "ಅನಿರೀಕ್ಷಿತ ವ್ಯಯ",
          tagEn: "Unplanned Outflow"
        },
        {
          id: 7,
          text: `ಯಾರ ಜೊತೆಯೂ ಅವಲಂಬಿತವಾಗಿರದೆ, ಸ್ವತಂತ್ರ ಅಧಿಕಾರ ಹಾಗೂ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವ ಸ್ಥಾನದಲ್ಲಿ ಕೆಲಸ ಮಾಡಿದಾಗ ಜಾತಕರ ಪೂರ್ಣ ಸಾಮರ್ಥ್ಯ ಹೊರಬರುತ್ತದೆ.`,
          tone: "good",
          tagKn: "ಸ್ವತಂತ್ರ ನಿರ್ಧಾರ ಶಕ್ತಿ",
          tagEn: "Autonomous Leadership"
        },
        {
          id: 8,
          text: `ವ್ಯವಹಾರ ಪಾಲುದಾರಿಕೆ ಅಥವಾ ಹಣದ ಲೆಕ್ಕಾಚಾರದಲ್ಲಿ ಯಾರನ್ನೂ ಕಣ್ಮುಚ್ಚಿ ನಂಬದೆ, ಪ್ರತಿಯೊಂದು ಒಪ್ಪಂದವನ್ನು ಲಿಖಿತವಾಗಿ ದಾಖಲಿಸುವುದು ಅತ್ಯಗತ್ಯ.`,
          tone: "notice",
          tagKn: "ಪಾಲುದಾರಿಕೆ ಎಚ್ಚರಿಕೆ",
          tagEn: "Partnership Caution"
        },
        {
          id: 9,
          text: `ದೀರ್ಘಾವಧಿಯ ಆಸ್ತಿ ಸೃಷ್ಟಿ ಹಾಗೂ ಸ್ಥಿರಾಸ್ತಿ ಹೂಡಿಕೆಯಲ್ಲಿ ಜಾತಕರಿಗೆ ಅದ್ಭುತ ಧನಯೋಗವಿದ್ದು, ವಯಸ್ಸು ಹೆಚ್ಚಿದಂತೆ ಸಂಪತ್ತು ವೃದ್ಧಿಯಾಗಲಿದೆ.`,
          tone: "good",
          tagKn: "ಸ್ಥಿರಾಸ್ತಿ ಯೋಗ",
          tagEn: "Asset Wealth Yoga"
        },
        {
          id: 10,
          text: `ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಾಗಿ ಯಾರ ಕೈಯನ್ನೂ ಚಾಚದಂತೆ ಕನಿಷ್ಠ 6 ತಿಂಗಳ ಖರ್ಚಿಗೆ ಸಮನಾದ ತುರ್ತು ನಿಧಿಯನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಇಟ್ಟುಕೊಳ್ಳುವುದು ಜಾಣತನ.`,
          tone: "notice",
          tagKn: "ತುರ್ತು ನಿಧಿ ಶಿಸ್ತು",
          tagEn: "Emergency Buffer"
        },
        {
          id: 11,
          text: `ಪ್ರಸ್ತುತ ದಶಾ ಸಂಚಾರದ ನಂತರ ಸಮಾಜದಲ್ಲಿ ಗೌರವ, ಅಧಿಕಾರ ಹಾಗೂ ಸ್ಥಿರ ಆರ್ಥಿಕ ಸುಭದ್ರತೆ ಕಟ್ಟಿಟ್ಟ ಬುತ್ತಿ ಎಂದು ಜಾತಕ ಸ್ಪಷ್ಟಪಡಿಸುತ್ತದೆ.`,
          tone: "good",
          tagKn: "ಆರ್ಥಿಕ ಗೌರವ ಸಿದ್ಧಿ",
          tagEn: "Financial Honor"
        }
      ]
    : [
        {
          id: 1,
          text: `10th Karma Bhava and Amatyakaraka disposition govern public reputation, authority, and occupational elevation.`,
          tone: "normal",
          tagKn: "10th House Foundation",
          tagEn: "10th House Foundation"
        },
        {
          id: 2,
          text: `Destined to achieve prominent success in leadership, advisory strategy, administration, specialized technology, or creative execution.`,
          tone: "good",
          tagKn: "Prime Career Sector",
          tagEn: "Prime Career Sector"
        },
        {
          id: 3,
          text: `Unyielding workplace integrity with deep disdain for cheap sycophancy, gossip, backstabbing, or shortcut compromises.`,
          tone: "good",
          tagKn: "Workplace Ethics",
          tagEn: "Workplace Ethics"
        },
        {
          id: 4,
          text: `Has experienced repeated historical episodes where less qualified peers claimed credit for foundational groundwork laid by the native.`,
          tone: "bad",
          tagKn: "Uncredited Labor",
          tagEn: "Uncredited Labor"
        },
        {
          id: 5,
          text: `Liquid cash inflows frequently drain rapidly into fixed commitments, family obligations, or capital assets, creating temporary cash pinches.`,
          tone: "bad",
          tagKn: "Cash Flow Lockup",
          tagEn: "Cash Flow Lockup"
        },
        {
          id: 6,
          text: `Overall income remains respectable, but money rarely rests idle in savings accounts due to immediate obligations.`,
          tone: "notice",
          tagKn: "Unplanned Outflow",
          tagEn: "Unplanned Outflow"
        },
        {
          id: 7,
          text: `Flourishes best when awarded autonomous jurisdiction and creative authority rather than operating under micromanaged surveillance.`,
          tone: "good",
          tagKn: "Autonomous Leadership",
          tagEn: "Autonomous Leadership"
        },
        {
          id: 8,
          text: `Business partnerships require strict, cold, black-and-white legal documentation to prevent unilateral burdens falling on the native.`,
          tone: "notice",
          tagKn: "Partnership Caution",
          tagEn: "Partnership Caution"
        },
        {
          id: 9,
          text: `Possesses potent long-term wealth yogas in landed real estate and immovable assets, multiplying net worth steadily with maturity.`,
          tone: "good",
          tagKn: "Asset Wealth Yoga",
          tagEn: "Asset Wealth Yoga"
        },
        {
          id: 10,
          text: `Maintaining an untouched 6-month liquid cushion is essential to eliminate subconscious anxiety during transitional phases.`,
          tone: "notice",
          tagKn: "Emergency Buffer",
          tagEn: "Emergency Buffer"
        },
        {
          id: 11,
          text: `The upcoming dasha phase unlocks enduring societal honor, managerial elevation, and material prosperity.`,
          tone: "good",
          tagKn: "Financial Honor",
          tagEn: "Financial Honor"
        }
      ];

  // -------------------------------------------------------------
  // Card 6: ದಶಾ ತಿರುವು & ಶ್ರೀ ಗೋಕರ್ಣ ಸಿದ್ಧ ಪರಿಹಾರ (Turning Point & Remedy - 11 points)
  // -------------------------------------------------------------
  const card6: AstrologerPointItem[] = isKn
    ? [
        {
          id: 1,
          text: `ಪ್ರಸ್ತುತ ಮಹಾದಶಾ '${toKannadaPlanet(runningMaha)}' ಹಾಗೂ ಭುಕ್ತಿ '${toKannadaPlanet(runningBhukti)}' ಸಂಚಾರದಲ್ಲಿದೆ (${dashaTimeline} ಅವಧಿ).`,
          tone: "normal",
          tagKn: "ಪ್ರಸ್ತುತ ದಶಾ ಸ್ಥಿತಿ",
          tagEn: "Active Dasha"
        },
        {
          id: 2,
          text: `ಪ್ರಸ್ತುತ ಭುಕ್ತಿಯಲ್ಲಿ ಇನ್ನೂ ಸುಮಾರು ${remainingMonths} ತಿಂಗಳುಗಳು ಬಾಕಿ ಇದ್ದು, ಇದು ಜೀವನದ ಮಹತ್ವದ ಪರಿವರ್ತನೆಯ ಪೂರ್ವಭಾವಿ ಹಂತವಾಗಿದೆ.`,
          tone: "notice",
          tagKn: "ಕಾಲಾವಧಿ ಎಣಿಕೆ",
          tagEn: "Transition Countdown"
        },
        {
          id: 3,
          text: `ದಶಾ ಸಂಧಿಕಾಲದ ಅಂತಿಮ ತಿಂಗಳುಗಳಲ್ಲಿ ಹಳೆಯ ಸಮಸ್ಯೆಗಳು ಕೊನೆಯ ಬಾರಿಗೆ ತೀವ್ರವಾಗಿ ಪರೀಕ್ಷೆ ಒಡ್ಡುವುದು ಸ್ವಾಭಾವಿಕವಾದ ಶಾಸ್ತ್ರೀಯ ನಿಯಮ.`,
          tone: "bad",
          tagKn: "ದಶಾ ಸಂಧಿ ಸವಾಲು",
          tagEn: "Dasha Sandhi Friction"
        },
        {
          id: 4,
          text: `ಗೋಚಾರ ಗುರು ಹಾಗೂ ಶನಿಯ ಸಂಚಾರವು ಅನುಕೂಲಕರ ತಿರುವನ್ನು ಸೂಚಿಸುತ್ತಿದ್ದು, ಮುಂದಿನ 3 ರಿಂದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ ಪ್ರಮುಖ ಬಿಕ್ಕಟ್ಟುಗಳು ಕರಗಲಿವೆ.`,
          tone: "good",
          tagKn: "ಗೋಚಾರ ಶುಭ ತಿರುವು",
          tagEn: "Gochara Breakthrough"
        },
        {
          id: 5,
          text: `ಅನಗತ್ಯವಾಗಿ ವಿಳಂಬವಾಗುತ್ತಿದ್ದ ಮಹತ್ವದ ಕೆಲಸಗಳು ಮುಂಬರುವ ದಿನಗಳಲ್ಲಿ ಅನಿರೀಕ್ಷಿತವಾಗಿ ವೇಗ ಪಡೆದುಕೊಳ್ಳುವುದನ್ನು ಜಾತಕರು ಕಾಣಲಿದ್ದಾರೆ.`,
          tone: "notice",
          tagKn: "ಕಾರ್ಯ ವೇಗ",
          tagEn: "Blockade Dissolution"
        },
        {
          id: 6,
          text: `ಯೋಗಕಾರಕ ರತ್ನ & ಉಂಗುರದ ಪ್ರಭಾವ: ${catalysts?.gemstoneRingCatalyst?.yogakarakaGemstoneKn || gemstoneNameKn} (${gemstoneWeight}) ರತ್ನವನ್ನು ${catalysts?.gemstoneRingCatalyst?.prescribedRingFingerKn || gemstoneFingerKn} ಬೆರಳಿಗೆ ಧರಿಸುವುದರಿಂದ ${catalysts?.gemstoneRingCatalyst?.catalyticImpactKn || "ಗ್ರಹಬಲ ವೃದ್ಧಿ"}.`,
          tone: "good",
          tagKn: "ಸಿದ್ಧ ರತ್ನ ಧಾರಣೆ",
          tagEn: "Yogakaraka Gemstone"
        },
        {
          id: 7,
          text: `ಕಳತ್ರ ಭಾಗ್ಯೋದಯ (ವಿವಾಹದ ನಂತರ ಅದೃಷ್ಟ): ${catalysts?.marriageBhagya?.detailedExplanationKn || "ವಿವಾಹದ ನಂತರ ಜೀವನ ಸಂಗಾತಿಯ ಆಗಮನದಿಂದ ಭಾಗ್ಯದ ಬಾಗಿಲು ತೆರೆಯಲಿದೆ."}`,
          tone: "good",
          tagKn: "ಕಳತ್ರ ಭಾಗ್ಯೋದಯ",
          tagEn: "Marriage Destiny Awakening"
        },
        {
          id: 8,
          text: `ಪುತ್ರಿ ಭಾಗ್ಯ & ಗೃಹಲಕ್ಷ್ಮೀ ಆಗಮನ: ${catalysts?.daughterBhagya?.lakshmiArrivalImpactKn || "ಗೃಹದಲ್ಲಿ ಹೆಣ್ಣು ಮಗುವಿನ ಆಗಮನದಿಂದ ಸಾಕ್ಷಾತ್ ಮಹಾಲಕ್ಷ್ಮಿಯ ಕೃಪೆ ಲಭಿಸಿ ಅಭಿವೃದ್ಧಿ ಪ್ರಾಪ್ತಿಯಾಗಲಿದೆ."}`,
          tone: "good",
          tagKn: "ಗೃಹಲಕ್ಷ್ಮೀ ಯೋಗ",
          tagEn: "Daughter Fortune"
        },
        {
          id: 9,
          text: `ನಾಮಾಕ್ಷರ ಕಂಪನ & ಧ್ವನಿ ತರಂಗಾಂತರ: ${catalysts?.nameSoundVibration?.vibrationHarmonyAnalysisKn || "ಜನ್ಮ ನಕ್ಷತ್ರದ ಪಾದಕ್ಕೆ ಅನುಗುಣವಾಗಿ ನಾಮ ಧ್ವನಿ ಕಂಪನವನ್ನು ಜೋಡಿಸುವುದು ನಿರಂತರ ಯಶಸ್ಸಿನ ರಹಸ್ಯ."}`,
          tone: "good",
          tagKn: "ನಾಮಾಕ್ಷರ ಕಂಪನ",
          tagEn: "Name Frequency"
        },
        {
          id: 10,
          text: `ದೈವಿಕ ರುದ್ರಾಕ್ಷಿ: ${rudrakshaNameKn} ರುದ್ರಾಕ್ಷಿಯನ್ನು ಸೋಮವಾರ ಪ್ರಾತಃಕಾಲ ಶುದ್ಧ ಮನಸ್ಸಿನಿಂದ ಧಾರಣೆ ಮಾಡುವುದು ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗೆ ಶ್ರೀರಕ್ಷೆ.`,
          tone: "good",
          tagKn: "ಪವಿತ್ರ ರುದ್ರಾಕ್ಷಿ",
          tagEn: "Sacred Rudraksha"
        },
        {
          id: 11,
          text: `ಪ್ರತಿದಿನ ಮುಂಜಾನೆ ಸೂರ್ಯೋದಯಕ್ಕೆ ಶಿವ ಪಂಚಾಕ್ಷರೀ ಜಪ ಅಥವಾ ಇಷ್ಟದೇವತಾ ಪ್ರಾರ್ಥನೆಯನ್ನು 108 ಬಾರಿ ತಪ್ಪದೆ ನೆರವೇರಿಸುವುದು ಶಾಂತಿ ತರುತ್ತದೆ.`,
          tone: "notice",
          tagKn: "ನಿತ್ಯ ಮಂತ್ರ ನಿಯಮ",
          tagEn: "Daily Chanting"
        },
        {
          id: 12,
          text: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಆತ್ಮಲಿಂಗಕ್ಕೆ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಮಾಂದಿ-ಶನಿ ದೋಷ ಶಾಂತಿ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.`,
          tone: "good",
          tagKn: "ಗೋಕರ್ಣ ಮಹಾ ಸಂಕಲ್ಪ",
          tagEn: "Gokarna Atma Linga Seva"
        },
        {
          id: 13,
          text: `ಪರಿಹಾರಗಳ ಆಚರಣೆಯ ನಂತರ ಮನಸ್ಸಿನ ಭಾರ ಕಡಿಮೆಯಾಗಿ, ವೃತ್ತಿ ಮತ್ತು ಕುಟುಂಬದಲ್ಲಿ ನವ ಚೈತನ್ಯ ಹಾಗೂ ಉತ್ಸಾಹ ಮರುಕಳಿಸುವುದು ಗ್ಯಾರಂಟಿ.`,
          tone: "good",
          tagKn: "ನವ ಚೈತನ್ಯ ಪ್ರಾಪ್ತಿ",
          tagEn: "Renewed Vitality"
        },
        {
          id: 14,
          text: `ಶ್ರೀ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಅನುಗ್ರಹವು ಜಾತಕರಿಗೆ ಸದಾ ಶ್ರೀರಕ್ಷೆಯಾಗಿದ್ದು, ಮುಂಬರುವ ದಿನಗಳಲ್ಲಿ ಶುಭ ಫಲಗಳು ಕೈಗೂಡಲಿವೆ.`,
          tone: "good",
          tagKn: "ಸನ್ನಿಧಾನದ ಆಶೀರ್ವಾದ",
          tagEn: "Divine Grace"
        }
      ]
    : [
        {
          id: 1,
          text: `Currently traversing '${runningMaha}' Mahadasha and '${runningBhukti}' Bhukti (${dashaTimeline}).`,
          tone: "normal",
          tagKn: "Active Dasha",
          tagEn: "Active Dasha"
        },
        {
          id: 2,
          text: `Approximately ${remainingMonths} months remain in the current Bhukti, marking a strategic inflection gateway.`,
          tone: "notice",
          tagKn: "Transition Countdown",
          tagEn: "Transition Countdown"
        },
        {
          id: 3,
          text: `Classical Dasha Sandhi transition often sparks a final wave of tests before closing lingering karmic cycles.`,
          tone: "bad",
          tagKn: "Dasha Sandhi Friction",
          tagEn: "Dasha Sandhi Friction"
        },
        {
          id: 4,
          text: `Favorable Gochara transits of Jupiter and Saturn unlock an empowering breakthrough window over the next 3 to 6 months.`,
          tone: "good",
          tagKn: "Gochara Breakthrough",
          tagEn: "Gochara Breakthrough"
        },
        {
          id: 5,
          text: `Stalled undertakings and frozen opportunities are scheduled to regain dramatic forward momentum.`,
          tone: "notice",
          tagKn: "Blockade Dissolution",
          tagEn: "Blockade Dissolution"
        },
        {
          id: 6,
          text: `Yogakaraka Gemstone Catalyst: Wearing ${catalysts?.gemstoneRingCatalyst?.yogakarakaGemstoneEn || gemstoneNameEn} (${gemstoneWeight}) on ${catalysts?.gemstoneRingCatalyst?.prescribedRingFingerEn || gemstoneFingerEn}: ${catalysts?.gemstoneRingCatalyst?.catalyticImpactEn || "strengthens prime benefic rays"}.`,
          tone: "good",
          tagKn: "Sacred Gemstone",
          tagEn: "Sacred Gemstone"
        },
        {
          id: 7,
          text: `Post-Marriage Destiny Awakening (Kalatra Bhagya): ${catalysts?.marriageBhagya?.detailedExplanationEn || "Arrival of your life partner unleashes dormant fortune and domestic prosperity."}`,
          tone: "good",
          tagKn: "Kalatra Bhagya",
          tagEn: "Kalatra Bhagya"
        },
        {
          id: 8,
          text: `Grihalakshmi Daughter Bhagya: ${catalysts?.daughterBhagya?.lakshmiArrivalImpactEn || "The arrival of a daughter acts as an auspicious celestial turning point, ushering family prosperity."}`,
          tone: "good",
          tagKn: "Daughter Fortune",
          tagEn: "Daughter Fortune"
        },
        {
          id: 9,
          text: `Acoustic Name Frequency & Harmonization: ${catalysts?.nameSoundVibration?.vibrationHarmonyAnalysisEn || "Phonetic alignment of official name and signature with Nakshatra Pada syllables dissolves obstacles."}`,
          tone: "good",
          tagKn: "Name Frequency",
          tagEn: "Name Frequency"
        },
        {
          id: 10,
          text: `Sacred Rudraksha: Auspicious ${rudrakshaNameEn} sanctified and worn on Monday morning for psychic armor.`,
          tone: "good",
          tagKn: "Sacred Rudraksha",
          tagEn: "Sacred Rudraksha"
        },
        {
          id: 11,
          text: `Daily morning discipline: Chanting the Shiva Panchakshari Mantra 108 times at dawn to stabilize emotional equanimity.`,
          tone: "notice",
          tagKn: "Daily Chanting",
          tagEn: "Daily Chanting"
        },
        {
          id: 12,
          text: `Sponsoring a Rudrabhisheka & Maandi-Shani Shanti Sankalpa at sacred Gokarna Mahabaleshwara Atma Linga Kshetra permanently clears the path.`,
          tone: "good",
          tagKn: "Gokarna Atma Linga Seva",
          tagEn: "Gokarna Atma Linga Seva"
        },
        {
          id: 13,
          text: `Post-remedy observance rapidly dissolves psychic heaviness, unlocking career prestige and domestic harmony.`,
          tone: "good",
          tagKn: "Renewed Vitality",
          tagEn: "Renewed Vitality"
        },
        {
          id: 14,
          text: `The eternal protective grace of Lord Mahabaleshwara shields the native, guaranteeing victorious turning points ahead.`,
          tone: "good",
          tagKn: "Divine Grace",
          tagEn: "Divine Grace"
        }
      ];

  return {
    openingIceBreaker: card1,
    hiddenSubconsciousWorry: card2,
    maandiKarmicImpact: card3,
    bodyMarkAndTemperament: card4,
    karmaFinancialReality: card5,
    immediateTurningPoint: card6
  };
}

/**
 * Merges raw AI or paragraph points with the deterministic foundation.
 * Guarantees that EVERY section has AT LEAST 10 bullet points.
 */
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
