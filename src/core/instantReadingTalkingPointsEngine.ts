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
 * Builds 11 deterministic, 100% authentic Shastric points for each of the First Six Sections.
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
  // Card 1: ಆರಂಭ & ಮೂಲ ಪ್ರಕೃತಿ (Ice-Breaker & Core Temperament - 11 points)
  // -------------------------------------------------------------
  const card1: AstrologerPointItem[] = isKn
    ? [
        {
          id: 1,
          text: `ಜಾತಕರ ಜನ್ಮ ಲಗ್ನವು '${lagnaRashiKn}' ಆಗಿದ್ದು, ಜನ್ಮ ರಾಶಿಯು '${moonRashiKn}' ಆಗಿದೆ. ಲಗ್ನಾಧಿಪತಿಯ ಪ್ರಭಾವವು ಜಾತಕರಲ್ಲಿ ಹುಟ್ಟಿನಿಂದಲೇ ಸ್ವಾಭಿಮಾನ ಹಾಗೂ ಘನತೆಯನ್ನು ಮೂಡಿಸಿದೆ.`,
          tone: "normal",
          tagKn: "ಜನ್ಮ ಲಗ್ನ ಸತ್ಯ",
          tagEn: "Lagna Foundation"
        },
        {
          id: 2,
          text: `ಆಂತರಿಕವಾಗಿ ಉನ್ನತ ಆತ್ಮಗೌರವ ಹಾಗೂ ತೀಕ್ಷ್ಣ ಬುದ್ಧಿಮತ್ತೆ ಹೊಂದಿದ್ದು, ನ್ಯಾಯಯುತ ಪರಿಶ್ರಮದಿಂದಲೇ ಸ್ವಾವಲಂಬಿಯಾಗಿ ಬಾಳಬೇಕೆಂಬ ದೃಢ ಸಂಕಲ್ಪವಿರುತ್ತದೆ.`,
          tone: "good",
          tagKn: "ಮೂಲ ಸಾಮರ್ಥ್ಯ",
          tagEn: "Core Strength"
        },
        {
          id: 3,
          text: `ಯಾರಾದರೂ ಪ್ರೀತಿ, ವಿಶ್ವಾಸ ಹಾಗೂ ಗೌರವದಿಂದ ಮಾತನಾಡಿಸಿದರೆ ಪ್ರಾಣವನ್ನಾದರೂ ಕೊಡಲು ಸಿದ್ಧವಾಗುವ ಉದಾರ ಹೃದಯ ಹಾಗೂ ನಿಷ್ಠೆ ಜಾತಕರ ನೈಜ ಗುಣ.`,
          tone: "good",
          tagKn: "ಪ್ರೀತಿಗೆ ನಿಷ್ಠೆ",
          tagEn: "Loyalty to Affection"
        },
        {
          id: 4,
          text: `ಆದರೆ ಯಾರಾದರೂ ಅಧಿಕಾರ ಚಲಾಯಿಸಲು, ಅಹಂಕಾರ ತೋರಲು ಅಥವಾ ಬಾಸ್ ತರಹ ನಿಯಂತ್ರಿಸಲು ಪ್ರಯತ್ನಿಸಿದರೆ ಜಾತಕರ ಮನಸ್ಸು ತೀವ್ರವಾಗಿ ಸಿಡಿಯುತ್ತದೆ.`,
          tone: "bad",
          tagKn: "ನಿಯಂತ್ರಣಕ್ಕೆ ಅಸಹನೆ",
          tagEn: "Anti-Domination"
        },
        {
          id: 5,
          text: `ನ್ಯಾಯಯುತವಲ್ಲದ ಟೀಕೆ ಅಥವಾ ಸುಳ್ಳು ಆರೋಪಗಳನ್ನು ಜಾತಕರು ಸುತಾರಾಂ ಸಹಿಸುವುದಿಲ್ಲ; ಅಂಥ ಸಂದರ್ಭದಲ್ಲಿ ಹಠಮಾರಿತನ ಅಥವಾ ತೀವ್ರ ಮೌನ ವಹಿಸುತ್ತಾರೆ.`,
          tone: "bad",
          tagKn: "ಪ್ರತಿರೋಧ ಪ್ರವೃತ್ತಿ",
          tagEn: "Resistance to Injustice"
        },
        {
          id: 6,
          text: `ಯಾವುದೇ ಹೊಸ ವಿಷಯವನ್ನು ಕ್ಷಿಪ್ರವಾಗಿ ಗ್ರಹಿಸುವ ಹಾಗೂ ಪರಿಸ್ಥಿತಿಯ ಒಳಮರ್ಮವನ್ನು ಮೊದಲ ನೋಟದಲ್ಲೇ ಅಳೆಯುವ ನೈಸರ್ಗಿಕ ತೀಕ್ಷ್ಣ ವಿಶ್ಲೇಷಣಾ ಶಕ್ತಿ ಇದೆ.`,
          tone: "good",
          tagKn: "ಬುದ್ಧಿಶಕ್ತಿ",
          tagEn: "Intuitive Intellect"
        },
        {
          id: 7,
          text: `ಮಾತಿನಲ್ಲಿ ಸ್ಪಷ್ಟತೆ, ನೇರ ನುಡಿ ಹಾಗೂ ಸತ್ಯದ ಧ್ವನಿ ಇರುವುದರಿಂದ ಕೆಲವೊಮ್ಮೆ ಸೌಮ್ಯ ಮನಸ್ಸಿನ ಜನರಿಗೆ ಮಾತು ಸ್ವಲ್ಪ ಕಟು ಅಥವಾ ಹರಿತವಾಗಿ ಕಾಣಬಹುದು.`,
          tone: "notice",
          tagKn: "ನೇರ ವಾಕ್ ಪ್ರವೃತ್ತಿ",
          tagEn: "Blunt Directness"
        },
        {
          id: 8,
          text: `ಕಷ್ಟದಲ್ಲಿರುವ ಯೋಗ್ಯ ವ್ಯಕ್ತಿಗಳಿಗೆ ಸದ್ದಿಲ್ಲದೆ ಸಹಾಯ ಮಾಡುವ ಹಾಗೂ ಮಾಡಿದ ಉಪಕಾರವನ್ನು ಪ್ರಚಾರ ಮಾಡಿಕೊಳ್ಳದ ಸಾತ್ವಿಕ ಸಂಸ್ಕಾರವಿದೆ.`,
          tone: "good",
          tagKn: "ಸಾತ್ವಿಕ ದಾನಶೀಲತೆ",
          tagEn: "Silent Benevolence"
        },
        {
          id: 9,
          text: `ಸ್ವಂತ ನಿರ್ಧಾರಗಳಲ್ಲಿ ದೃಢತೆಯಿದ್ದು, ಇತರರ ಅನಾವಶ್ಯಕ ಸಲಹೆಗಳಿಂದ ದಿಕ್ಕು ತಪ್ಪದೆ ತನ್ನದೇ ಆದ ನಿಯಮಗಳ ಮೇಲೆ ಜೀವನ ರೂಪಿಸಿಕೊಳ್ಳುತ್ತಾರೆ.`,
          tone: "good",
          tagKn: "ಸ್ವಾವಲಂಬನೆ",
          tagEn: "Self-Reliance"
        },
        {
          id: 10,
          text: `ಆಪ್ತ ಸ್ನೇಹಿತರ ಬಳಗವು ಚಿಕ್ಕದಾಗಿದ್ದರೂ, ಅತ್ಯಂತ ನಂಬಿಕಸ್ಥ ಹಾಗೂ ಆಯ್ದ ಕೆಲವರೊಂದಿಗೆ ಮಾತ್ರ ಅಂತರಂಗದ ವಿಷಯಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳುವ ಎಚ್ಚರಿಕೆಯಿದೆ.`,
          tone: "notice",
          tagKn: "ಗೋಪ್ಯ ರಕ್ಷಣೆ",
          tagEn: "Inner Circle Caution"
        },
        {
          id: 11,
          text: `ದೈವಭಕ್ತಿ ಹಾಗೂ ಪೂರ್ವಪುಣ್ಯದ ಬಲವಿದ್ದು, ಕಷ್ಟಕಾಲದಲ್ಲಿ ಎಷ್ಟೇ ಎಡವಿದರೂ ಮತ್ತೆ ಎದ್ದು ನಿಲ್ಲುವ ಅಪೂರ್ವ ಚೇತರಿಕಾ ಸಾಮರ್ಥ್ಯ ಜಾತಕರಿಗಿದೆ.`,
          tone: "good",
          tagKn: "ಪುನಶ್ಚೇತನ ಶಕ್ತಿ",
          tagEn: "Resilience Yoga"
        }
      ]
    : [
        {
          id: 1,
          text: `Native's Ascendant is '${lagnaRashiEn}' with Moon in '${moonRashiEn}'. Lagna lord's placement imparts strong inherent self-esteem and dignified bearing.`,
          tone: "normal",
          tagKn: "Lagna Foundation",
          tagEn: "Lagna Foundation"
        },
        {
          id: 2,
          text: `Endowed with sharp intellect and unshakeable pride in earned self-sufficiency, seeking progress solely on merit.`,
          tone: "good",
          tagKn: "Core Strength",
          tagEn: "Core Strength"
        },
        {
          id: 3,
          text: `Unwavering loyalty and warm devotion when approached with authentic affection, dignity, and sincere respect.`,
          tone: "good",
          tagKn: "Loyalty to Affection",
          tagEn: "Loyalty to Affection"
        },
        {
          id: 4,
          text: `Absolute zero tolerance for authoritarian intimidation, arrogance, or unwarranted micromanagement by others.`,
          tone: "bad",
          tagKn: "Anti-Domination",
          tagEn: "Anti-Domination"
        },
        {
          id: 5,
          text: `Prone to stubborn rigidity or deep withdrawal when subjected to unmerited blame, gossip, or false accusations.`,
          tone: "bad",
          tagKn: "Resistance to Injustice",
          tagEn: "Resistance to Injustice"
        },
        {
          id: 6,
          text: `High innate intuitive faculty capable of reading between the lines and decoding unstated motives in people rapidly.`,
          tone: "good",
          tagKn: "Intuitive Intellect",
          tagEn: "Intuitive Intellect"
        },
        {
          id: 7,
          text: `Direct, unflinching speech that values truth above diplomacy, which can occasionally appear blunt to sensitive peers.`,
          tone: "notice",
          tagKn: "Blunt Directness",
          tagEn: "Blunt Directness"
        },
        {
          id: 8,
          text: `Instinctive moral compass to support deserving people quietly without seeking cheap applause or public attention.`,
          tone: "good",
          tagKn: "Silent Benevolence",
          tagEn: "Silent Benevolence"
        },
        {
          id: 9,
          text: `Strong conviction in personal vision; charts destiny through independent principles rather than following the herd.`,
          tone: "good",
          tagKn: "Self-Reliance",
          tagEn: "Self-Reliance"
        },
        {
          id: 10,
          text: `Guards an impenetrable inner sanctuary; maintains a strictly selective circle of confidants for emotional safety.`,
          tone: "notice",
          tagKn: "Inner Circle Caution",
          tagEn: "Inner Circle Caution"
        },
        {
          id: 11,
          text: `Blessed with Purva Punya resilience, bouncing back with renewed vigor from disruptions that break ordinary mortals.`,
          tone: "good",
          tagKn: "Resilience Yoga",
          tagEn: "Resilience Yoga"
        }
      ];

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
          text: `ಶಾಸ್ತ್ರೋಕ್ತ ರತ್ನ ಧಾರಣೆ: ${gemstoneNameKn} (${gemstoneWeight}) ರತ್ನವನ್ನು ${gemstoneFingerKn} ಬೆರಳಿಗೆ ಧರಿಸುವುದರಿಂದ ಗ್ರಹಬಲ ವೃದ್ಧಿ.`,
          tone: "good",
          tagKn: "ಸಿದ್ಧ ರತ್ನ ಧಾರಣೆ",
          tagEn: "Sacred Gemstone"
        },
        {
          id: 7,
          text: `ದೈವಿಕ ರುದ್ರಾಕ್ಷಿ: ${rudrakshaNameKn} ರುದ್ರಾಕ್ಷಿಯನ್ನು ಸೋಮವಾರ ಪ್ರಾತಃಕಾಲ ಶುದ್ಧ ಮನಸ್ಸಿನಿಂದ ಧಾರಣೆ ಮಾಡುವುದು ನಕಾರಾತ್ಮಕ ಶಕ್ತಿಗೆ ಶ್ರೀರಕ್ಷೆ.`,
          tone: "good",
          tagKn: "ಪವಿತ್ರ ರುದ್ರಾಕ್ಷಿ",
          tagEn: "Sacred Rudraksha"
        },
        {
          id: 8,
          text: `ಪ್ರತಿದಿನ ಮುಂಜಾನೆ ಸೂರ್ಯೋದಯಕ್ಕೆ ಶಿವ ಪಂಚಾಕ್ಷರೀ ಜಪ ಅಥವಾ ಇಷ್ಟದೇವತಾ ಪ್ರಾರ್ಥನೆಯನ್ನು 108 ಬಾರಿ ತಪ್ಪದೆ ನೆರವೇರಿಸುವುದು ಶಾಂತಿ ತರುತ್ತದೆ.`,
          tone: "notice",
          tagKn: "ನಿತ್ಯ ಮಂತ್ರ ನಿಯಮ",
          tagEn: "Daily Chanting"
        },
        {
          id: 9,
          text: `ಶ್ರೀ ಕ್ಷೇತ್ರ ಗೋಕರ್ಣ ಮಹಾಬಲೇಶ್ವರ ಸ್ವಾಮಿಯ ಆತ್ಮಲಿಂಗಕ್ಕೆ ರುದ್ರಾಭಿಷೇಕ ಹಾಗೂ ಮಾಂದಿ-ಶನಿ ದೋಷ ಶಾಂತಿ ಸಂಕಲ್ಪ ಸೇವೆ ನೆರವೇರಿಸುವುದು ಅತ್ಯಂತ ಶ್ರೇಷ್ಠ.`,
          tone: "good",
          tagKn: "ಗೋಕರ್ಣ ಮಹಾ ಸಂಕಲ್ಪ",
          tagEn: "Gokarna Atma Linga Seva"
        },
        {
          id: 10,
          text: `ಪರಿಹಾರಗಳ ಆಚರಣೆಯ ನಂತರ ಮನಸ್ಸಿನ ಭಾರ ಕಡಿಮೆಯಾಗಿ, ವೃತ್ತಿ ಮತ್ತು ಕುಟುಂಬದಲ್ಲಿ ನವ ಚೈತನ್ಯ ಹಾಗೂ ಉತ್ಸಾಹ ಮರುಕಳಿಸುವುದು ಗ್ಯಾರಂಟಿ.`,
          tone: "good",
          tagKn: "ನವ ಚೈತನ್ಯ ಪ್ರಾಪ್ತಿ",
          tagEn: "Renewed Vitality"
        },
        {
          id: 11,
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
          text: `Sacred Gemstone: ${gemstoneNameEn} (${gemstoneWeight}) set on ${gemstoneFingerEn} to amplify benefic radiation.`,
          tone: "good",
          tagKn: "Sacred Gemstone",
          tagEn: "Sacred Gemstone"
        },
        {
          id: 7,
          text: `Sacred Rudraksha: Auspicious ${rudrakshaNameEn} sanctified and worn on Monday morning for psychic armor.`,
          tone: "good",
          tagKn: "Sacred Rudraksha",
          tagEn: "Sacred Rudraksha"
        },
        {
          id: 8,
          text: `Daily morning discipline: Chanting the Shiva Panchakshari Mantra 108 times at dawn to stabilize emotional equanimity.`,
          tone: "notice",
          tagKn: "Daily Chanting",
          tagEn: "Daily Chanting"
        },
        {
          id: 9,
          text: `Sponsoring a Rudrabhisheka & Maandi-Shani Shanti Sankalpa at sacred Gokarna Mahabaleshwara Atma Linga Kshetra permanently clears the path.`,
          tone: "good",
          tagKn: "Gokarna Atma Linga Seva",
          tagEn: "Gokarna Atma Linga Seva"
        },
        {
          id: 10,
          text: `Post-remedy observance rapidly dissolves psychic heaviness, unlocking career prestige and domestic harmony.`,
          tone: "good",
          tagKn: "Renewed Vitality",
          tagEn: "Renewed Vitality"
        },
        {
          id: 11,
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
          parsedPoints.push({
            id: idx + 1,
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
        const parsedPoints: AstrologerPointItem[] = lines.slice(0, 12).map((text, idx) => {
          const clean = sanitizeAstrologyKannadaText(text);
          const tone = classifyAstrologyTextTone(clean);
          return {
            id: idx + 1,
            text: clean,
            tone,
            tagKn: getToneLabel(tone, true),
            tagEn: getToneLabel(tone, false)
          };
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
