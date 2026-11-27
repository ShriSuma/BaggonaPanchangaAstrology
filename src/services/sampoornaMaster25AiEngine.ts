/**
 * ============================================================================
 * SAMPOORNA MASTER 25-CHAPTER — GEMINI AI NARRATIVE & UNIQUE EXAMPLE ENGINE
 * ============================================================================
 * Powered strictly by `gemini-3.5-flash-lite` via `askGemini`.
 *
 * Mission:
 *  - Eliminate repetitive/hardcoded story metaphors & canned examples across all
 *    25 chapters, across multiple family members, and across repeat downloads
 *    by the same devotee.
 *  - Keep 100% of Vedic math, houses, Rashis, Dashas, SAV scores, Gochara,
 *    Yogas, Doshas, Tarabala dates, and Sri Kshetra Gokarna remedies grounded
 *    in the deterministic calculation snapshot.
 *  - Enforce 100% single-script purity across all 7 supported languages:
 *    Kannada (kn), English (en), Hindi (hi), Tamil (ta), Telugu (te),
 *    Malayalam (ml), Marathi (mr).
 *  - Retry patiently with exponential backoff & script validation so AI
 *    narration succeeds cleanly even under transient congestion.
 * ============================================================================
 */

import { askGemini } from "../core/GeminiEngine";
import { cleanEnglishFromRegionalText } from "../features/premiumPdf/premiumPdfLocale";
import {
  type SevenLang,
  LANG_ENGLISH_NAMES,
  LANG_NATIVE_NAMES,
  pick7,
  toNativeDigits7L,
} from "./sampoornaMaster25Locale7L";
import type { ActiveDoshaProfile, ChartVisualMetrics } from "./sampoornaMaster25StoryEngine";

export interface SampoornaAiChapterDraft {
  chapterNumber: number;
  title: string;
  chapterBadge: string;
  devoteeQuestion: string;
  storyHook: string;
  paragraphs: string[];
  practicalGuidance: string;
}

export interface SampoornaAiDoshaInsight {
  id: string;
  doingNow: string;
  exactAction: string;
}

export interface SampoornaAiGenerationResult {
  isAiGenerated: boolean;
  aiRunId: string;
  batchesSucceeded: number;
  aiChaptersCount: number;
  coverHeadlineHook?: string;
  coverTagline?: string;
  coverAssurancePara1?: string;
  coverAssurancePara2?: string;
  familyProtectionHook?: string;
  chaptersByNumber: Map<number, SampoornaAiChapterDraft>;
  doshaInsightsById: Map<string, SampoornaAiDoshaInsight>;
}

export interface SampoornaAiChartSnapshot {
  targetLang: SevenLang;
  devoteeName: string;
  ageYears: number;
  ageCategory: string;
  isMinor: boolean;
  isInfant: boolean;
  isChild: boolean;
  isTeen: boolean;
  isSenior: boolean;
  gender: string;
  maritalStatus: string;
  childrenStatus: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  lagnaName: string;
  lagnaLord: string;
  lagnaRashiIdx: number;
  moonRashi: string;
  moonLord: string;
  moonRashiIdx: number;
  nakshatraName: string;
  pakshaName: string;
  tithiName: string;
  weekdayName: string;
  yogaName: string;
  karanaName: string;
  janmaHora: string;
  janmaDashaBalance: string;
  currentMahadasha: string;
  currentBhukti: string;
  bhuktiEndDate: string;
  yogiPlanet: string;
  yogiColor: string;
  yogiDirection: string;
  yogiDay: string;
  avayogiPlanet: string;
  bhriguBinduRashi: string;
  bhriguBinduHouse: number;
  maandiRashi: string;
  maandiHouse: number;
  maandiDomainTheme: string;
  shaniTransitRashi: string;
  shaniHouseFromMoon: number;
  guruTransitRashi: string;
  guruHouseFromMoon: number;
  dominantElement: string;
  detectedYogasSummary: string;
  detectedDoshasSummary: string;
  heroPlanetName: string;
  heroPlanetHouse: number;
  heroPlanetRashi: string;
  nearestColleagueName: string;
  nearestColleagueHouse: number;
  nearestColleagueRashi: string;
  liveTarabalaHeadline: string;
  tarabalaReportDateStr: string;
  savByHouse: number[];
  badhakaHouse: number;
  badhakaLord: string;
  neechaBhangaSummary: string;
  vedhaSummary: string;
  activeDoshaProfiles: ActiveDoshaProfile[];
  chartVisualMetrics: ChartVisualMetrics;
  narrativeVariant: number;
  houseSummaryLines: string;
  timePrecision?: "exact" | "approx_window" | "date_only_chandra" | "no_dob_instant";
  btrSummary?: string;
  sankhyaSummary?: string;
}

// ============================================================================
// 1. DIVERSE REAL-LIFE STORY ARENAS & ANTI-REPETITION ENTROPY POOL
// ============================================================================

const MINOR_LIFE_ARENAS = [
  "morning school assembly announcement and steady breathing before stage",
  "tying a cotton kite string smoothly against shifting afternoon gust",
  "clay lump centering slowly on a traditional village potter's wheel",
  "learning bicycle balance along a tree-lined residential lane",
  "sharpening geometry compass points neatly before a diagram exam",
  "tending a tender mango sapling with bamboo support stakes",
  "hearing a twilight folk parable on a grandparent's cool veranda",
  "catching raindrops in clean brass bowls under slanted roof tiles",
  "tuning percussion tabla syllables slowly before accelerating tempo",
  "sorting sunlit pebbles by lustre and weight along a river bank",
  "folding clean paper boats in courtyard monsoon channels",
  "finding the right page bookmark in a thick library storybook",
  "waiting patiently for a brass festival lamp wick to draw oil upward",
  "passing a relay wooden baton cleanly inside the track exchange zone",
  "sketching symmetrical rangoli dots silently before connecting curves",
  "wiping mist off a train windowpane at sunrise to spot distant hills",
  "lining up dominoes with calm spacing across a smooth wooden desk",
  "measuring spoonfuls of jaggery syrup for festive laddoos",
  "listening for clear echoes across a quiet stone temple corridor",
  "practicing swim strokes near the shallow tiled wall of a pool",
  "checking needle-north stillness on a pocket brass magnetic compass",
  "counting star constellations from an open dark village terrace",
  "helping carry warm banana-leaf prasada plates without spilling",
  "solving an interlocking wooden puzzle box by observing hidden grooves",
  "watering potted tulsi herbs every morning at the exact sunrise hour",
  "arranging colored glass marbles by sunlight refraction angle"
];

const ADULT_LIFE_ARENAS = [
  "dawn express train platform where luggage check beats last-minute sprinting",
  "South Indian brass dabarah-tumbler decoction slowly brewing before pouring",
  "double-entry handwritten merchant ledger revealing hidden leakage margins",
  "monsoon roof terracotta tiles inspected one ridge before the first storm",
  "handloom silk weaver adjusting warp tension before casting the gold zari",
  "coastal tidal sluice gate opening strictly at slack tide rather than peak swell",
  "classical violin peg micro-tuning in silent backstage seconds before raga begins",
  "spices roasted sequentially on heavy iron kadai by aroma rather than clock",
  "mechanical wristwatch mainspring wound just shy of overwinding strain",
  "Western Ghats hairpin mountain climb shifting down one gear early",
  "hydraulic arch dam spillway released gradually before crest saturation",
  "endgame chess pawn advance timed when the opponent's rook lacks open files",
  "silver-lining artisan hammering thin leaf patiently without tearing corners",
  "blacksmith quenching glowing steel blade into seasoned sesame oil",
  "agricultural canal check-dam diverting dry-season stream evenly to tail fields",
  "copper vessel tin-lining (kalai) renewing bright safety before acidic cooking",
  "bookshop owner culling dusty slow shelves to spotlight timely primers",
  "marathon runner sipping salted lime water at kilometer twenty-two before cramps",
  "rainwater harvesting recharge pit filtered through graded gravel and sand",
  "mason testing vertical stone pillar plumb-bob alignment before setting mortar",
  "archipelago ferry captain reading cross-current foam lines around rocky shoals",
  "spice wholesale auctioneer waiting silently through the first noisy bidding round",
  "artisan calligraphy nib held at consistent angle across handmade cotton paper",
  "rooftop solar panel array tilted ten degrees seasonally for midday yield",
  "beehive frame inspection conducted gently at noon when foragers are outdoors",
  "bakery wood-fired oven tested with flour dust thermal scorch before loading loaves",
  "temple stone lamp reservoir refilled before oil drops below the twisted wick",
  "software flight-recorder logs pinpointing one silent memory leak behind crashes",
  "architect examining core-drilled bedrock samples before approving five-story load",
  "traditional ayurvedic kashaya simmering steadily to exact one-fourth reduction",
  "night courier sorting rack separating local pincodes from air-freight pouches",
  "bamboo scaffolding lashings re-tightened after three days of coastal drizzle",
  "violinist rosin application calibrated for humid monsoon hall acoustics",
  "seed vault jar sealed with dried neem leaves and wood ash against damp",
  "suspension bridge hanger rods tensioned evenly across opposite spans",
  "catamaran wooden outrigger lashed to absorb beam waves without capsizing",
  "surgical tray sterilizer autoclave gauge checked before opening sterile wrap",
  "diamond cutter cleaving along natural crystal grain rather than forcing force",
  "classical raga alapana unfolding note by note before rhythmic tala enters",
  "village stone well iron pulley oiled cleanly so the rope glides without jerks"
];

const PERSPECTIVE_VOICES = [
  "calm observant family astrologer sitting in warm Gokarna courtyard light — earthy, concrete, practical",
  "sharp strategic mentor blending classical Jyotisha timing with crisp modern real-world cause and effect",
  "warm storytelling elder using memorable everyday Indian household and occupational vignettes",
  "lucid diagnostic analyst turning subtle planetary math into unmistakable daily life clarity"
];

function fnv1aHash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededShuffle<T>(items: readonly T[], seedNum: number): T[] {
  const arr = [...items];
  let s = seedNum || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const BANNED_LEGACY_CLICHES = [
  "99%",
  "vault door",
  "coiled rope",
  "brass safe",
  "cracked mirror",
  "undercurrent",
  "ship at harbor",
  "diamond under pressure",
  "hidden hinge",
  "unlit wick",
  "frozen river"
];

// ============================================================================
// 2. CHAPTER TOPIC SPECIFICATIONS (MATCHING ORIGINAL 25-CHAPTER PLAN EXACTLY)
// ============================================================================

const CHAPTER_SPEC_LIST: ReadonlyArray<{ num: number; topic: string; focus: string }> = [
  { num: 1, topic: "First Reflection & Live Today Tarabala", focus: "Why this person feels quietly unsettled or ready right now; explicitly ground today's Tarabala on [tarabalaReportDateStr] in brackets without Puja upsell." },
  { num: 2, topic: "Ruling Graha Driver (Hero Planet) & Allied Support", focus: "Contrast their Hero Planet (house & sign) with their Nearest Ally/Colleague planet and why effort succeeds best through that ally." },
  { num: 3, topic: "Secret Wealth & Luck Ignition Switch (Yogi Planet)", focus: "Expose Yogi vs Avayogi polarity: exact lucky direction, color, weekday, and everyday habit that unlocks their Yogi flow." },
  { num: 4, topic: "Quiet Internal Pressure & Karmic Friction Point (Maandi)", focus: "Illuminate where Maandi sits, its exact house theme, and why small recurring worries or overthinking gather in that specific arena." },
  { num: 5, topic: "Innate Panchabhuta Element Core & Temperament Edge", focus: "Explain their dominant and secondary elements + percent balance as an everyday superpower vs blindspot." },
  { num: 6, topic: "Birth Tithi, Nitya Yoga & Core Intuition Pattern", focus: "Show how natal Tithi (Paksha), Nitya Yoga, Karana, and Janma Hora shape decision timing and gut instinct." },
  { num: 7, topic: "Active Mahadasha Atmosphere & Chapter of Time", focus: "Translate current Mahadasha lord and its house/functional nature into what this chapter of years is actually demanding." },
  { num: 8, topic: "Sub-Period Turning Key & Bhukti Transition Window", focus: "Illuminate current Antardasha (Bhukti) lord and exact Bhukti end date shift — what closes and what opens." },
  { num: 9, topic: "Sade Sati / Shani Gochara Discipline & Structural Test", focus: "Locate Transit Saturn's exact house from natal Moon, clarify reality without fear-mongering, and map steady brick-by-brick gains." },
  { num: 10, topic: "Guru Gochara Protective Door & Expansion Corridor", focus: "Locate Transit Jupiter's exact house from Moon + Vedha filter — showing where grace protects even during busy tests." },
  { num: 11, topic: "Natal Yogas, Neecha Bhanga & Quiet Strengths Already Present", focus: "Name ONLY the genuinely detected Yogas & Neecha Bhanga in this chart and explain how they rescue or lift outcomes in real life." },
  { num: 12, topic: "Life Pillar I — Vitality, Stamina & Body Signal Rhythm", focus: "Grounded in Lagna H1 SAV bindus and Lagna lord placement (adapt completely safely for age/minor/infant if under 18)." },
  { num: 13, topic: "Life Pillar II — Education, Craft, Work & Skill Expression", focus: "Grounded in H5/H10 lords and SAV scores (for children/teens focus strictly on joyful learning, habits & parents' nurturing)." },
  { num: 14, topic: "Life Pillar III — Family Bonds, Partnership & Trust Equanimity", focus: "Grounded in H2/H4/H7 lords and SAV scores (for children/teens focus strictly on affectionate parents/grandparents/siblings — ZERO romance/marriage)." },
  { num: 15, topic: "Life Pillar IV — Financial Flow, Savings & Resource Discipline", focus: "Grounded in H2/H11 SAV scores, Yogi vs Avayogi traps, and household resource stewardship." },
  { num: 16, topic: "Life Pillar V — Mental Peace, Sleep & Emotional Anchoring", focus: "Grounded in H4/Moon sign/H12 SAV balance and calm emotional boundaries." },
  { num: 17, topic: "Immediate 90-Day Tactile Action Window & Tarabala Timing", focus: "Micro-horizon next 90 days combining current Bhukti momentum, Yogi weekday, and H1/H6/H10 readiness." },
  { num: 18, topic: "Year +1 — Consolidation, Quiet Pruning & Structural Reset", focus: "Horizon Year +1 ahead: exact SAV high vs low house leverage without overnight fantasies." },
  { num: 19, topic: "Year +2 & Bhrigu Bindu Destiny Shift Checkpoint", focus: "Horizon Year +2 centered around their exact Bhrigu Bindu Rashi & house destiny pivot." },
  { num: 20, topic: "Year +3 — Peak Expansion & Earned Visibility Corridor", focus: "Horizon Year +3 combining Dashas and strongest SAV houses (peak bindu sector)." },
  { num: 21, topic: "Year +4 — Harvest, Stewardship & Protective Boundaries", focus: "Horizon Year +4 keeping gains sustainable while avoiding Avayogi or Badhaka leaks." },
  { num: 22, topic: "Year +5 — Deep Legacy, Long-Range Mastery & Calm Harvest", focus: "Horizon Year +5 connecting H9 fortune lord and long-term dignity." },
  { num: 23, topic: "Consolidated Scientific Dosha Audit (Kuja, Sarpa, Shani, Maandi)", focus: "Scientifically explain ONLY detected Doshas (or why major ones are clear/cancelled) + Kuja, Sarpa, Shani, Maandi degree context and calm Sri Kshetra Gokarna remedial logic without fear." },
  { num: 24, topic: "Daily 10-Minute Pragmatic Practice & Nakshatra-Yogi Ritual", focus: "Simple, dignified daily lamp, breath, charitable conduct & Yogi-weekday rhythm tailored to natal Nakshatra." },
  { num: 25, topic: "Final Personal Verdict, Gokarna Shelter & Preservation Promise", focus: "Emotional synthesis of their full chart + reassuring blessing from Sri Kshetra Gokarna Mahabaleshwara." }
];

// ============================================================================
// 3. LANGUAGE & SCRIPT PURITY RULES + POST-AI GUARD
// ============================================================================

function getStrictLanguageRule(lang: SevenLang): string {
  const noCodeSwitch = "NEVER mix Latin/English letters or another Indic script inside any native word (write every technical or craft word 100% natively).";
  switch (lang) {
    case "kn":
      return `OUTPUT LANGUAGE: 100% pure Kannada (ಕನ್ನಡ ಲಿಪಿ only). Use Kannada numerals (೦-೯) or natural Kannada phrasing. ZERO English/Latin letters or words anywhere. ZERO Hindi/Devanagari/Tamil/Telugu/Malayalam characters. ${noCodeSwitch}`;
    case "mr":
      return `OUTPUT LANGUAGE: 100% pure natural Marathi (मराठी भाषा, देवनागरी लिपी only). Use idiomatic Marathi grammar (तुमच्या / आपल्या, आहे, करा, होईल) — DO NOT use Hindi words (आपका, है, कीजिए). Use Devanagari digits (०-९). ZERO English/Latin letters or words. ${noCodeSwitch}`;
    case "hi":
      return `OUTPUT LANGUAGE: 100% pure natural Hindi (हिन्दी देवनागरी लिपि only). Use Devanagari digits (०-९). ZERO English/Latin letters or words anywhere. ${noCodeSwitch}`;
    case "te":
      return `OUTPUT LANGUAGE: 100% pure Telugu (తెలుగు లిపి only). ZERO English/Latin letters, ZERO Kannada/Hindi/Tamil/Malayalam characters. ${noCodeSwitch}`;
    case "ta":
      return `OUTPUT LANGUAGE: 100% pure Tamil (தமிழ் எழுத்துக்கள் only). ZERO English/Latin letters, ZERO Devanagari script, ZERO Sanskrit symbols like ॐ or ॥ or ।. Use pure Tamil words for all Vedic concepts. ${noCodeSwitch}`;
    case "ml":
      return `OUTPUT LANGUAGE: 100% pure natural Malayalam (മലയാളം ലിപി only). Use modern Arabic numerals (0-9). ZERO English/Latin letters, ZERO Devanagari script or symbols (ॐ/॥/।), ZERO Tamil/Kannada/Telugu characters. ${noCodeSwitch}`;
    case "en":
    default:
      return "OUTPUT LANGUAGE: 100% natural, vivid, dignified English. Warm Indian classical clarity without stiff robotic prose.";
  }
}

const SCRIPT_REGEX_MAP: Record<Exclude<SevenLang, "en">, RegExp> = {
  kn: /[\u0C80-\u0CFF]/,
  mr: /[\u0900-\u097F]/,
  hi: /[\u0900-\u097F]/,
  te: /[\u0C00-\u0C7F]/,
  ta: /[\u0B80-\u0BFF]/,
  ml: /[\u0D00-\u0D7F]/
};

function hasDominantTargetScript(text: string, lang: SevenLang): boolean {
  if (!text || text.trim().length < 30) return false;
  if (lang === "en") {
    const latinCount = (text.match(/[a-zA-Z]/g) || []).length;
    return latinCount >= 40;
  }
  const targetMatches = (text.match(new RegExp(SCRIPT_REGEX_MAP[lang].source, "g")) || []).length;
  const latinMatches = (text.match(/[a-zA-Z]/g) || []).length;
  return targetMatches >= 35 && targetMatches > latinMatches * 2;
}

function cleanAiText(text: string, lang: SevenLang): string {
  if (!text) return "";
  let s = String(text)
    .replace(/\*\*/g, "")
    .replace(/[#`]/g, "")
    .replace(/__+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Strictly forbid Nakshatra Pada tokens across Sampoorna 25-Chapter report
  s = s
    .replace(/\bNakshatra\s*Pada\s*\d+\b/gi, "")
    .replace(/\bPada\s*[-–:]?\s*\d+\b/gi, "")
    .replace(/(?:ಪಾದ|चरण|पाद|పాదం|பாதம்|പാദം)\s*[-–:]?\s*[\d೦-೯०-९౦-౯௦-௯]+/gi, "")
    .replace(/\(\s*[,;:\-–•]*\s*\)/g, "")
    .trim();

  if (lang !== "en") {
    // Strip Devanagari sacred symbols in Tamil & Malayalam cleanly
    if (lang === "ta" || lang === "ml") {
      s = s.replace(/[ॐ॥।]/g, " ");
    }
    s = s
      .split("•")
      .map((seg) => cleanEnglishFromRegionalText(seg, lang).trim())
      .filter(Boolean)
      .join(" • ");
  }

  return s
    .replace(/^(?:ಪ್ರಶ್ನೆ|प्रश्न|ప్రశ్న|கேள்வி|ചോദ്യം|Question|Q)\s*:\s*/iu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanParagraphText(text: string, lang: SevenLang): string {
  if (!text) return "";
  let s = String(text)
    .replace(/\*\*/g, "")
    .replace(/[#`]/g, "")
    .replace(/__+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  s = s
    .replace(/\bNakshatra\s*Pada\s*\d+\b/gi, "")
    .replace(/\bPada\s*[-–:]?\s*\d+\b/gi, "")
    .replace(/(?:ಪಾದ|चरण|पाद|పాదం|பாதம்|പാദം)\s*[-–:]?\s*[\d೦-೯०-९౦-౯௦-௯]+/gi, "")
    .replace(/\(\s*[,;:\-–•]*\s*\)/g, "")
    .trim();

  if (lang !== "en") {
    if (lang === "ta" || lang === "ml") {
      s = s.replace(/[ॐ॥।]/g, " ");
    }
    s = cleanEnglishFromRegionalText(s, lang).trim();
  }
  return s.replace(/\s{2,}/g, " ").trim();
}

// ============================================================================
// 4. ROBUST JSON PARSER & CONTEXT BUILDER
// ============================================================================

function robustParseAiJson<T = any>(rawText: string): T | null {
  if (!rawText || typeof rawText !== "string") return null;
  let cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const firstObj = cleaned.indexOf("{");
  const lastObj = cleaned.lastIndexOf("}");
  if (firstObj !== -1 && lastObj > firstObj) {
    cleaned = cleaned.slice(firstObj, lastObj + 1);
  }

  const attempts = [
    cleaned,
    cleaned.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]"),
    cleaned.replace(/[\u0000-\u001F]+/g, " ").replace(/,\s*}/g, "}").replace(/,\s*]/g, "]")
  ];

  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // try next repair pass
    }
  }
  return null;
}

function buildChartGroundingBlock(snap: SampoornaAiChartSnapshot & { isEarlyChildSafe?: () => boolean }): string {
  const savs = snap.savByHouse;
  const ageStage = snap.isInfant
    ? "INFANT (<2 yrs) — STRICT CHILDHOOD SAFETY: focus solely on parents' care, health, warmth, peaceful sleep. NEVER mention jobs, loans, marriage, romance."
    : snap.isChild || Boolean(snap.isEarlyChildSafe?.())
    ? `YOUNG CHILD (${Math.round(snap.ageYears)} yrs) — STRICT CHILDHOOD SAFETY: focus strictly on joyful schooling, curiosity, family warmth, balanced habits. ZERO romance/marriage/career-stress.`
    : snap.isTeen
    ? `TEENAGER (${Math.round(snap.ageYears)} yrs) — STRICT MINOR SAFETY: focus on study focus, emotional confidence, mentors, creative curiosity. ZERO marriage/adult romance.`
    : snap.isSenior
    ? `SENIOR (${Math.round(snap.ageYears)} yrs) — focus on dignity, health stewardship, serenity, grandchildren/family respect, spiritual solace.`
    : `ADULT (${Math.round(snap.ageYears)} yrs, ${snap.gender}, ${snap.maritalStatus}, ${snap.childrenStatus}).`;

  const doshaLines = snap.activeDoshaProfiles.length > 0
    ? snap.activeDoshaProfiles.map((d) => `  - [id="${d.id}"] ${d.title} (${d.severityLabel}): Current effect="${d.doingNow}" | Area="${d.affectingArea}" | Remedy focus="${d.exactAction}"`).join("\n")
    : "  - None flagged as high-severity (Kuja/Sarpa/Maandi/Shani balanced or mitigated).";

  const precisionRule =
    snap.timePrecision === "date_only_chandra" || snap.timePrecision === "no_dob_instant"
      ? `PRECISION RULE (CHANDRA LAGNA BASIS — TIME UNKNOWN): Birth minute is NOT verified. Houses above are mathematically anchored strictly to Moon Sign (Chandra Lagna) + planetary positions + Gochara + Numerology${snap.sankhyaSummary ? ` (${snap.sankhyaSummary})` : ""}. NEVER mention "12:00 noon", exact rising degree, or hour-dependent Maandi/Hora as fixed birth time facts.`
      : snap.timePrecision === "approx_window"
      ? `PRECISION RULE (2-TAP BTR RECTIFIED WINDOW): Narrowed via Solar Window & personality rectification${snap.btrSummary ? ` (${snap.btrSummary})` : ""}. Emphasize Moon Sign, Dasha, Transits, and confirmed Lagna tendencies with balanced clarity.`
      : "";

  return [
    `[DETERMINISTIC VEDIC CHART SNAPSHOT — USE EXACT DATA ONLY, DO NOT ALTER NUMBERS OR SIGNS]`,
    ...(precisionRule ? [precisionRule] : []),
    `Devotee: ${snap.devoteeName} | Life Stage: ${ageStage}`,
    `Birth: ${snap.birthDate} ${snap.birthTime} at ${snap.birthPlace}`,
    `Ascendant (Lagna): ${snap.lagnaName} (Lord: ${snap.lagnaLord}) | Moon Sign: ${snap.moonRashi} (Lord: ${snap.moonLord})`,
    `Birth Nakshatra: ${snap.nakshatraName} (NOTE: NEVER mention Pada) | Tithi: ${snap.tithiName} (${snap.pakshaName})`,
    `Weekday: ${snap.weekdayName} | Nitya Yoga: ${snap.yogaName} | Karana: ${snap.karanaName} | Birth Hora: ${snap.janmaHora}`,
    `Janma Dasha Balance: ${snap.janmaDashaBalance}`,
    `Active Dasha-Bhukti: ${snap.currentMahadasha} - ${snap.currentBhukti} (ends ${snap.bhuktiEndDate})`,
    `Hero Planet: ${snap.heroPlanetName} (House ${snap.heroPlanetHouse}, ${snap.heroPlanetRashi}) | Closest Ally: ${snap.nearestColleagueName} (House ${snap.nearestColleagueHouse}, ${snap.nearestColleagueRashi})`,
    `Yogi Planet: ${snap.yogiPlanet} (Color: ${snap.yogiColor}, Direction: ${snap.yogiDirection}, Lucky Day: ${snap.yogiDay}) | Avayogi: ${snap.avayogiPlanet}`,
    `Maandi: House ${snap.maandiHouse} (${snap.maandiRashi}) — domain: ${snap.maandiDomainTheme}`,
    `Bhrigu Bindu: House ${snap.bhriguBinduHouse} (${snap.bhriguBinduRashi}) | Dominant Elements: ${snap.dominantElement}`,
    `Gochar Transits from Moon: Shani in House ${snap.shaniHouseFromMoon} (${snap.shaniTransitRashi}) | Guru in House ${snap.guruHouseFromMoon} (${snap.guruTransitRashi}) | Vedha: ${snap.vedhaSummary}`,
    `Badhaka: House ${snap.badhakaHouse} (Lord ${snap.badhakaLord}) | Neecha Bhanga: ${snap.neechaBhangaSummary}`,
    `Live Today Tarabala (${snap.tarabalaReportDateStr}): ${snap.liveTarabalaHeadline}`,
    `Detected Yogas: ${snap.detectedYogasSummary}`,
    `SAV Strength (H1-H12): H1=${savs[1]}, H2=${savs[2]}, H3=${savs[3]}, H4=${savs[4]}, H5=${savs[5]}, H6=${savs[6]}, H7=${savs[7]}, H8=${savs[8]}, H9=${savs[9]}, H10=${savs[10]}, H11=${savs[11]}, H12=${savs[12]}`,
    `Key Houses Map: ${snap.houseSummaryLines}`,
    `Active Doshas Summary (${snap.detectedDoshasSummary}):\n${doshaLines}`
  ].join("\n");
}

// ============================================================================
// 5. BATCH RUNNER WITH RETRIES, BACKOFF, AND CROSS-BATCH DEDUP
// ============================================================================

const PROGRESS_LABELS: Record<SevenLang, Record<string, string>> = {
  kn: {
    b1: "AI ನಿಮ್ಮ ಜಾತಕದ ಮುಖಪುಟ ಮತ್ತು ೧–೬ ಅಧ್ಯಾಯಗಳ ಅನನ್ಯ ಕಥನವನ್ನು ರಚಿಸುತ್ತಿದೆ...",
    b2: "AI ದಶಾ-ಗೋಚಾರ ಹಾಗೂ ೭–೧೧ ಅಧ್ಯಾಯಗಳ ವೈಯಕ್ತಿಕ ಉದಾಹರಣೆಗಳನ್ನು ಬರೆಯುತ್ತಿದೆ...",
    b3: "AI ಜೀವನದ ಪಂಚ-ಸ್ತಂಭಗಳ (೧೨–೧೬ ಅಧ್ಯಾಯ) ನೈಜ ದೃಷ್ಟಾಂತಗಳನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತಿದೆ...",
    b4: "AI ಮುಂಬರುವ ೫ ವರ್ಷಗಳ (೧೭–೨೨ ಅಧ್ಯಾಯ) ಕಾಲದರ್ಶನ ಕಥನವನ್ನು ರೂಪಿಸುತ್ತಿದೆ...",
    b5: "AI ದೋಷ ಪರಿಶೀಲನೆ, ನಿತ್ಯ ಸಾಧನೆ ಹಾಗೂ ಗೋಕರ್ಣ ಆಶೀರ್ವಾದವನ್ನು (೨೩–೨೫ ಅಧ್ಯಾಯ) ಪೂರ್ಣಗೊಳಿಸುತ್ತಿದೆ..."
  },
  mr: {
    b1: "AI आपल्या पत्रिकेचे मुखपृष्ठ व अध्याय १–६ साठी अनन्य उदाहरणे लिहित आहे...",
    b2: "AI दशा-गोचर व अध्याय ७–११ साठी वैयक्तिक कथन तयार करत आहे...",
    b3: "AI जीवनाच्या ५ आधारस्तंभांचे (अध्याय १२–१६) नवे दाखले लिहित आहे...",
    b4: "AI पुढील ५ वर्षांचा (अध्याय १७–२२) अनोखा प्रवास शब्दबद्ध करत आहे...",
    b5: "AI दोष विश्लेषण व गोकर्ण आशीर्वाद (अध्याय २३–२५) पूर्ण करत आहे..."
  },
  hi: {
    b1: "AI आपकी कुंडली का मुखपृष्ठ और अध्याय १–६ की अनूठी कथा रच रहा है...",
    b2: "AI दशा-गोचर तथा अध्याय ७–११ के मौलिक उदाहरण तैयार कर रहा है...",
    b3: "AI जीवन के ५ स्तंभों (अध्याय १२–१६) के नए जीवन-दृष्टांत लिख रहा है...",
    b4: "AI आगामी ५ वर्षों (अध्याय १७–२२) की व्यक्तिगत भविष्य-कथा गढ़ रहा है...",
    b5: "AI दोष समीक्षा एवं गोकर्ण आशीर्वाद (अध्याय २३–२५) पूर्ण कर रहा है..."
  },
  te: {
    b1: "AI మీ జాతక ముఖచిత్రం మరియు 1–6 అధ్యాయాల ప్రత్యేక కథనాన్ని రూపొందిస్తోంది...",
    b2: "AI దశా-గోచారం మరియు 7–11 అధ్యాయాల కొత్త ఉదాహరణలు రాస్తోంది...",
    b3: "AI జీవన 5 స్తంభాల (12–16 అధ్యాయాలు) వ్యక్తిగత దృష్టాంతాలు సిద్ధం చేస్తోంది...",
    b4: "AI రాబోయే 5 ఏళ్ల (17–22 అధ్యాయాలు) ప్రత్యేక భవిష్యత్ కథనాన్ని తీర్చిదిద్దుతోంది...",
    b5: "AI దోష విశ్లేషణ & గోకర్ణ ఆశీస్సు (23–25 అధ్యాయాలు) పూర్తి చేస్తోంది..."
  },
  ta: {
    b1: "AI உங்கள் ஜாதக முகப்பு மற்றும் அத்தியாயம் 1–6-க்கு தனித்துவமான கதைகளை உருவாக்குகிறது...",
    b2: "AI தசா-கோசாரம் மற்றும் அத்தியாயம் 7–11-க்கான புதிய எடுத்துக்காட்டுகளை எழுதுகிறது...",
    b3: "AI வாழ்வின் 5 தூண்கள் (அத்தியாயம் 12–16) தனிப்பட்ட விளக்கங்களை உருவாக்குகிறது...",
    b4: "AI அடுத்த 5 ஆண்டுகளுக்கான (அத்தியாயம் 17–22) சிறப்புப் பயணத்தை அமைக்கிறது...",
    b5: "AI தோஷ ஆய்வு மற்றும் கோகர்ண ஆசி (அத்தியாயம் 23–25) நிறைவு செய்கிறது..."
  },
  ml: {
    b1: "AI നിങ്ങളുടെ ജാതക മുഖചിത്രവും അധ്യായം 1–6 ലെ തനതായ ഉദാഹരണങ്ങളും തയ്യാറാക്കുന്നു...",
    b2: "AI ദശാ-ഗോചരവും അധ്യായം 7–11 ലെ പുതിയ വിവരണങ്ങളും എഴുതുന്നു...",
    b3: "AI ജീവിതത്തിലെ 5 തൂണുകൾ (അധ്യായം 12–16) വ്യക്തിഗത ദൃഷ്ടാന്തങ്ങളോടെ ഒരുക്കുന്നു...",
    b4: "AI അടുത്ത 5 വർഷത്തെ (അധ്യായം 17–22) ഭാവി വിവരണങ്ങൾ രൂപപ്പെടുത്തുന്നു...",
    b5: "AI ദോഷ പരിശോധനയും ഗോകർണ്ണ ആശിസ്സും (അധ്യായം 23–25) പൂർത്തിയാക്കുന്നു..."
  },
  en: {
    b1: "AI is crafting your personalized cover & unique stories for Chapters 1–6...",
    b2: "AI is weaving original Dasha & Transit examples for Chapters 7–11...",
    b3: "AI is authoring fresh life-pillar narratives & metaphors for Chapters 12–16...",
    b4: "AI is composing your non-repetitive 5-year horizon (Chapters 17–22)...",
    b5: "AI is completing Dosha audit insights & Sri Gokarna blessings (Chapters 23–25)..."
  }
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiBatchWithRetry<T>(
  batchLabel: string,
  prompt: string,
  apiKey: string,
  lang: SevenLang,
  validate: (parsed: T) => boolean,
  maxAttempts = 6
): Promise<T | null> {
  const langName = LANG_ENGLISH_NAMES[lang] || "English";
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let isTransientServiceErr = false;
    try {
      const attemptPrompt =
        attempt === 1
          ? prompt
          : `${prompt}\n\n[RETRY #${attempt} STRICT CORRECTION]: Your prior response failed format or language purity verification. You MUST return ONLY a valid JSON object matching the schema strictly, written 100% in pure ${langName} (${LANG_NATIVE_NAMES[lang]}) script with ZERO English/foreign words if non-English, and ALL requested chapter numbers complete.`;

      const timeoutPromise = new Promise<string>((resolve) =>
        setTimeout(() => resolve(""), 55000)
      );

      const raw = await Promise.race([
        askGemini(batchLabel, attemptPrompt, apiKey, langName, {
          raw: true,
          temperature: Math.min(1.0, 0.88 + attempt * 0.02),
          retries: 1,
          retryDelay: 1200
        }),
        timeoutPromise
      ]);

      const parsed = robustParseAiJson<T>(raw);
      if (parsed && validate(parsed)) {
        return parsed;
      }
    } catch (err: any) {
      const msg = String(err?.message || err || "");
      isTransientServiceErr = /503|429|unavailable|quota|overloaded/i.test(msg);
      console.warn(`[sampoornaMaster25AiEngine] ${batchLabel} attempt ${attempt}/${maxAttempts} warning:`, err);
    }

    if (attempt < maxAttempts) {
      const waitMs = isTransientServiceErr
        ? Math.round(2800 * attempt + Math.random() * 800)
        : Math.round(1400 * Math.pow(1.65, attempt - 1) + Math.random() * 450);
      await sleep(waitMs);
    }
  }
  return null;
}

export async function generateSampoorna25AiNarratives(
  snapInput: Omit<SampoornaAiChartSnapshot, "targetLang"> & { targetLang: SevenLang },
  apiKey: string,
  onProgress?: (pct: number, msg: string) => void
): Promise<SampoornaAiGenerationResult> {
  const aiRunId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const chaptersByNumber = new Map<number, SampoornaAiChapterDraft>();
  const doshaInsightsById = new Map<string, SampoornaAiDoshaInsight>();
  const cleanKey = (apiKey || "").trim();

  if (!cleanKey) {
    return {
      isAiGenerated: false,
      aiRunId,
      batchesSucceeded: 0,
      aiChaptersCount: 0,
      chaptersByNumber,
      doshaInsightsById
    };
  }

  // Augment helper on snap safely
  const isChildLike = snapInput.ageYears < 13 && snapInput.ageYears >= 2;
  const snapWithHelper = {
    ...snapInput,
    isEarlyChildSafe: () => isChildLike
  };
  const groundingBlock = buildChartGroundingBlock(snapWithHelper as any);

  const arenaPool = snapInput.isMinor ? MINOR_LIFE_ARENAS : ADULT_LIFE_ARENAS;
  const entropySeed = fnv1aHash(
    `${snapInput.devoteeName}|${snapInput.birthDate}|${snapInput.birthTime}|${snapInput.narrativeVariant}|${aiRunId}`
  );
  const shuffledArenas = seededShuffle(arenaPool, entropySeed);
  const voiceLens = PERSPECTIVE_VOICES[(snapInput.narrativeVariant + (entropySeed % 7)) % PERSPECTIVE_VOICES.length];

  const lang = snapInput.targetLang;
  const strictLangRule = getStrictLanguageRule(lang);
  const langMsgs = pick7(PROGRESS_LABELS, lang);

  // Track used hooks / badges / metaphor snippets across batches so later batches avoid echoing earlier ones
  const usedHooksAndMotifs: string[] = [];
  const usedBadges = new Set<string>();
  let coverHeadlineHook: string | undefined;
  let coverTagline: string | undefined;
  let coverAssurancePara1: string | undefined;
  let coverAssurancePara2: string | undefined;
  let familyProtectionHook: string | undefined;
  let batchesSucceeded = 0;

  const normalizeAiChapter = (rawCh: any): SampoornaAiChapterDraft | null => {
    const chNum = Number(rawCh?.chapterNumber);
    if (!Number.isFinite(chNum) || chNum < 1 || chNum > 25) return null;

    const title = cleanAiText(String(rawCh?.title || ""), lang);
    let badge = cleanAiText(String(rawCh?.chapterBadge || ""), lang);
    const question = cleanAiText(String(rawCh?.devoteeQuestion || ""), lang);
    const storyHook = cleanAiText(String(rawCh?.storyHook || ""), lang);
    const guidance = cleanAiText(String(rawCh?.practicalGuidance || ""), lang);

    const rawParas: string[] = Array.isArray(rawCh?.paragraphs)
      ? rawCh.paragraphs
      : [rawCh?.p1, rawCh?.p2, rawCh?.p3, rawCh?.p4].filter(Boolean);
    const cleanedParas = rawParas
      .map((p) => cleanParagraphText(String(p || ""), lang))
      .filter((p) => p.length >= 35);

    if (!title || !question || !storyHook || !guidance || cleanedParas.length < 3) {
      return null;
    }

    // Ensure unique badge across all 25 chapters
    if (!badge || usedBadges.has(badge)) {
      const chTag = lang === "en" ? `#${chNum}` : toNativeDigits7L(chNum, lang);
      badge = `${badge || title.split(" ").slice(0, 2).join(" ")} (${chTag})`;
    }
    usedBadges.add(badge);

    return {
      chapterNumber: chNum,
      title,
      chapterBadge: badge,
      devoteeQuestion: question,
      storyHook,
      paragraphs: cleanedParas.slice(0, 4),
      practicalGuidance: guidance
    };
  };

  const buildBatchPrompt = (
    batchNums: number[],
    includeCover: boolean,
    includeDoshaAndFamily: boolean
  ): string => {
    const chapterTasks = batchNums
      .map((num) => {
        const spec = CHAPTER_SPEC_LIST[num - 1];
        const arena = shuffledArenas[(num - 1) % shuffledArenas.length];
        return `  * Chapter ${num} — Subject: ${spec.topic} | Chart Mandate: ${spec.focus} | UNIQUE EXAMPLE ARENA ASSIGNED FOR CH ${num}: "${arena}" (Invent a completely original, realistic story scene & everyday example inside this arena tailored strictly to ${snapInput.devoteeName}'s life stage and exact chart math above!)`;
      })
      .join("\n");

    const priorAvoid =
      usedHooksAndMotifs.length > 0
        ? `\nPREVIOUSLY USED HOOKS/OPENINGS IN THIS BOOK (DO NOT REPEAT OR PARAPHRASE): ${usedHooksAndMotifs.slice(-12).join(" | ")}`
        : "";

    const extraSchemaFields = includeCover
      ? `  "coverHeadlineHook": "...",
  "coverTagline": "...",
  "coverAssurancePara1": "...",
  "coverAssurancePara2": "...",
`
      : "";

    const doshaFamilyFields = includeDoshaAndFamily
      ? `  "familyProtectionHook": "Warm 2-sentence note noting that spouse/children/parents have separate birth charts & Dashas at Sri Kshetra Gokarna without clichés.",
  "doshaInsights": [
    ${snapInput.activeDoshaProfiles.map((d) => `{ "id": "${d.id}", "doingNow": "1-2 vivid, non-fear-based everyday sentences specific to this person's age & house", "exactAction": "Authentic Sri Gokarna & daily step" }`).join(",\n    ")}
  ],
`
      : "";

    return `You are authoring an authentic, deeply personal Vedic Astrology chapter batch for Baggona Panchanga (Sri Kshetra Gokarna).

${strictLangRule}

ANTI-REPETITION & ZERO-HARDCODING MANDATE (CRITICAL):
- Session Unique Salt: ${aiRunId} (Download Edition #${snapInput.narrativeVariant + 1}) | Narrative Style Lens: ${voiceLens}
- Imagine 10 people in the SAME family buy this report AND one user downloads it multiple times: EVERY download and EVERY person MUST receive fresh, distinct real-world analogies, story openings, questions, and examples — NEVER generic stock astrology prose!
- STRICTLY BANNED OVERUSED CLICHES (never use or translate these metaphors): ${BANNED_LEGACY_CLICHES.join(", ")}.
- NEVER start two chapters with the same opening words or grammatical template.
- For Ch 1..22: Focus purely on psychological clarity, planetary insight, and practical everyday wisdom (NO fear-mongering and NO temple puja sales pitches!).
- NEVER mention "Pada", "Nakshatra Pada", "ಪಾದ", "चरण", "పాదం", "பாதம்", or "പാദം" anywhere.
- Write clean flowing text inside JSON strings with ZERO Markdown characters (*, #, backticks).
- Keep EVERY mathematical placement, Lagna, Rashi, Nakshatra, Dasha, Bhukti end date (${snapInput.bhuktiEndDate}), SAV bindu score, Gochara house, Yogi, Avayogi, Maandi, Yoga name, and Dosha status 100% faithful to the data below!
${priorAvoid}

${groundingBlock}

CHAPTERS TO WRITE IN THIS BATCH:
${chapterTasks}
${includeCover ? `\nALSO WRITE COVER TEXT: coverHeadlineHook (1 vivid sentence about this person's chart edge), coverTagline (concise royal subtitle), coverAssurancePara1 (warm personal dedication mentioning birth date, time, place, Lagna, Moon, Nakshatra — NO PADA), coverAssurancePara2 (calm promise of 25-chapter clarity under Sri Kshetra Gokarna Mahabaleshwara grace).` : ""}
${includeDoshaAndFamily ? `\nALSO INCLUDE Ch 23 Dosha Audit insights for each active dosha ID listed above (mention Kuja, Sarpa, Maandi, Shani clarity scientifically inside Chapter 23 prose) AND Ch 11 must name their detected Yogas explicitly AND Ch 25 closes with Sri Gokarna Mahabaleshwara shelter.` : ""}
${batchNums.includes(1) ? `\nIMPORTANT FOR CHAPTER 1: Naturally weave today's Tarabala date [${snapInput.tarabalaReportDateStr}] inside square brackets or parentheses in Question or Paragraph 1 so the devotee sees exact today-only timing!` : ""}

Return ONLY valid JSON matching this exact structure:
{
${extraSchemaFields}${doshaFamilyFields}  "chapters": [
    {
      "chapterNumber": ${batchNums[0]},
      "title": "Compelling localized chapter title without Chapter prefix",
      "chapterBadge": "Unique 2-4 word thematic badge",
      "devoteeQuestion": "1 deeply personal question without writing Question: prefix",
      "storyHook": "1 vivid italicized hook sentence introducing the fresh real-life scene",
      "paragraphs": [
        "Paragraph 1 (160-240 chars): The concrete everyday real-life story/example in your assigned arena.",
        "Paragraph 2 (160-240 chars): The Astrological Mechanism & Twist linking that exact story to this person's real chart numbers/planets/houses.",
        "Paragraph 3 (150-220 chars): Practical everyday step and habit adjustment strictly appropriate for their exact age.",
        "Paragraph 4 (150-220 chars): Chart-grounded synthesis weaving relevant Dasha, SAV, Yogi/Avayogi or Gokarna reassurance cleanly."
      ],
      "practicalGuidance": "1 actionable, crisp golden takeaway sentence/rule for the summary box."
    }
  ]
}`;
  };

  const batchDefinitions: Array<{
    key: "b1" | "b2" | "b3" | "b4" | "b5";
    pct: number;
    nums: number[];
    includeCover: boolean;
    includeDoshaAndFamily: boolean;
  }> = [
    { key: "b1", pct: 28, nums: [1, 2, 3, 4, 5, 6], includeCover: true, includeDoshaAndFamily: false },
    { key: "b2", pct: 44, nums: [7, 8, 9, 10, 11], includeCover: false, includeDoshaAndFamily: false },
    { key: "b3", pct: 60, nums: [12, 13, 14, 15, 16], includeCover: false, includeDoshaAndFamily: false },
    { key: "b4", pct: 76, nums: [17, 18, 19, 20, 21, 22], includeCover: false, includeDoshaAndFamily: false },
    { key: "b5", pct: 90, nums: [23, 24, 25], includeCover: false, includeDoshaAndFamily: true }
  ];

  for (const batch of batchDefinitions) {
    onProgress?.(batch.pct, langMsgs[batch.key]);
    const prompt = buildBatchPrompt(batch.nums, batch.includeCover, batch.includeDoshaAndFamily);

    const parsed = await callGeminiBatchWithRetry<any>(
      `Sampoorna25 Batch ${batch.key.toUpperCase()}`,
      prompt,
      cleanKey,
      lang,
      (obj) => {
        if (!obj || !Array.isArray(obj.chapters)) return false;
        const foundNums = new Set<number>();
        for (const c of obj.chapters) {
          const n = Number(c?.chapterNumber);
          const pArr = Array.isArray(c?.paragraphs) ? c.paragraphs : [];
          const joined = `${c?.title || ""} ${c?.storyHook || ""} ${pArr.join(" ")}`;
          if (batch.nums.includes(n) && pArr.length >= 3 && hasDominantTargetScript(joined, lang)) {
            foundNums.add(n);
          }
        }
        return batch.nums.every((reqNum) => foundNums.has(reqNum));
      },
      6
    );

    if (parsed) {
      let batchValidCount = 0;
      if (batch.includeCover) {
        const chHook = cleanAiText(String(parsed.coverHeadlineHook || ""), lang);
        const cTag = cleanAiText(String(parsed.coverTagline || ""), lang);
        const cP1 = cleanParagraphText(String(parsed.coverAssurancePara1 || ""), lang);
        const cP2 = cleanParagraphText(String(parsed.coverAssurancePara2 || ""), lang);
        if (hasDominantTargetScript(chHook, "en") || hasDominantTargetScript(cP1, lang)) {
          if (chHook.length >= 25) coverHeadlineHook = chHook;
          if (cTag.length >= 15) coverTagline = cTag;
          if (cP1.length >= 80 && hasDominantTargetScript(cP1, lang)) coverAssurancePara1 = cP1;
          if (cP2.length >= 80 && hasDominantTargetScript(cP2, lang)) coverAssurancePara2 = cP2;
        }
      }

      if (batch.includeDoshaAndFamily) {
        const fam = cleanParagraphText(String(parsed.familyProtectionHook || ""), lang);
        if (fam.length >= 30 && hasDominantTargetScript(fam, lang)) {
          familyProtectionHook = fam;
        }
        if (Array.isArray(parsed.doshaInsights)) {
          for (const d of parsed.doshaInsights) {
            const id = String(d?.id || "").trim();
            if (!id) continue;
            const doingNow = cleanParagraphText(String(d?.doingNow || d?.simpleStoryMeaning || ""), lang);
            const exactAction = cleanParagraphText(String(d?.exactAction || d?.remedyAction || ""), lang);
            if (doingNow.length >= 25 && hasDominantTargetScript(doingNow, lang)) {
              doshaInsightsById.set(id, {
                id,
                doingNow,
                exactAction
              });
            }
          }
        }
      }

      for (const rawCh of parsed.chapters) {
        const norm = normalizeAiChapter(rawCh);
        if (norm) {
          chaptersByNumber.set(norm.chapterNumber, norm);
          usedHooksAndMotifs.push(norm.storyHook.slice(0, 75));
          batchValidCount++;
        }
      }
      if (batchValidCount > 0) {
        batchesSucceeded++;
      }
    }
  }

  return {
    isAiGenerated: chaptersByNumber.size >= 15,
    aiRunId,
    batchesSucceeded,
    aiChaptersCount: chaptersByNumber.size,
    coverHeadlineHook,
    coverTagline,
    coverAssurancePara1,
    coverAssurancePara2,
    familyProtectionHook,
    chaptersByNumber,
    doshaInsightsById
  };
}
