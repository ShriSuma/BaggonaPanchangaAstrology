/**
 * Prompt construction for the Premium PDF.
 *
 * Three problems this module exists to solve:
 *
 * 1. Wording repeated across chapters. Each chapter is a separate model call,
 *    so without being told, the model opens all seven of them the same way.
 *    Every prompt now carries a scope contract naming the other chapters.
 *
 * 2. English leaking into a regional book. Proper nouns are the worst offender,
 *    so graha, rashi and nakshatra names are handed to the model ALREADY in the
 *    target script. It never has to translate a name, so it cannot mistranslate one.
 *
 * 3. Generic readings. Every chapter now receives the real chart: natal
 *    positions, the running dasha and bhukti, live transits, and what the
 *    Baggona and B.V. Raman engines actually found.
 */

import {
  type GrahaKey,
  pick,
  tp,
  getDevoteeQuestionForCategory,
  GRAHA_L5,
  RASHI_L5,
  NAKSHATRA_L5,
  languageContract,
  accuracyContract,
  noRepeatContract
} from "./premiumPdfLocale";

export type NatalPlacement = {
  graha: GrahaKey;
  rashiIndex: number;
  house: number;
  degree?: number;
  navamshaRashiIndex?: number;
  isCombust?: boolean;
  retrograde?: boolean;
  debilitated?: boolean;
  exalted?: boolean;
  isVargottama?: boolean;
  dignityLabel?: string;
};

export type TransitPlacement = {
  graha: GrahaKey;
  rashiIndex: number;
  houseFromMoon: number;
};

export type EngineFinding = {
  name: string;
  /** Some engines return a list of effects rather than one sentence. */
  significance?: string | string[];
  remedy?: string;
};

const asText = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value.join(" ") : value ?? "";

export type PremiumPromptInput = {
  lang: string;
  runId: string;
  name: string;
  gender?: "Male" | "Female";
  ageYears: number;
  maritalStatus?: "unmarried" | "married" | "general";
  hasChildren?: "no_children" | "has_children" | "general";

  lagnaRashiIndex: number | null;
  moonRashiIndex: number | null;
  moonNakshatraIndex: number | null;
  sunRashiIndex: number | null;

  natalPlanets: NatalPlacement[];
  transits: TransitPlacement[];

  mahaLord: GrahaKey | null;
  bhuktiLord: GrahaKey | null;
  bhuktiEndsAtAge: number | null;
  bhuktiEndDateFormatted?: string;

  engineYogas: EngineFinding[];
  engineDoshas: EngineFinding[];
  pariharas: string[];

  shadowSelf: string;
  karmicBaggage: string;
  lifePhase: string;
  overallTone: string;
  careerNote: string;
  financeNote: string;
  roadmap: { month: string; prediction: string }[];

  affairNote: string;
  maandiHouse?: number | null;
  maandiRashiIndex?: number | null;
  moonPada?: 1 | 2 | 3 | 4;
  tithiName?: string;
  weekdayName?: string;
  yogaName?: string;
  karanaName?: string;
  dagdhaRashis?: string;
  todayTithiName?: string;
  todayVaaraName?: string;
  todayMoonNakshatra?: string;
  taraBalaName?: string;
  chandraBalaHouse?: number | string;
  isManglikCancelled?: boolean;
  manglikCancellationReason?: string;
  dashaSandhiActive?: boolean;
  dashaSandhiDetails?: string;
  maandiConjunctions?: string[];
};

const rashiName = (index: number | null, lang: string): string =>
  index === null || index < 0 || index > 11 ? "?" : pick(RASHI_L5[index], lang);

const nakshatraName = (index: number | null, lang: string): string =>
  index === null || index < 0 || index > 26 ? "?" : pick(NAKSHATRA_L5[index], lang);

const grahaName = (graha: GrahaKey, lang: string): string => pick(GRAHA_L5[graha], lang);

/**
 * Emotional Persona & Sacred Pastoral Warmth Calibration.
 * Instructs AI to speak as the devotee's own beloved family priest (Kulapurohita)
 * with deep empathy, fatherly affection, and authentic personal connection.
 */
export const buildEmotionalAnchor = (input: PremiumPromptInput): string => {
  const { name, ageYears, maritalStatus, hasChildren } = input;
  const isStruggling = input.dashaSandhiActive || (input.engineDoshas && input.engineDoshas.length > 0);
  const isChildless = maritalStatus === "married" && hasChildren === "no_children";

  return [
    `SACRED KULAPUROHITA (FAMILY PRIEST) VOICE & DEEP PERSONAL EMOTION (MANDATORY):`,
    `You are NOT a detached academic commentator or generic textbook astrologer. You are ${name}'s revered family priest (ಕುಲಪುರೋಹಿತ / कुलपुरोहित) who carries deep spiritual affection and personal concern for ${name}'s path.`,
    `- Speak directly to ${name} with fatherly warmth, sacred authority, and sincere encouragement.`,
    `- MANDATORY NAME WEAVING: Explicitly address "${name}" by name in EVERY single paragraph (at least 3-4 times in each chapter). The devotee must immediately feel: "This was personally written for me alone."`,
    `- STRICT ZERO-DEGREE RULE: Absolutely NEVER write degrees, minutes, or degree symbols (e.g. NEVER output '15°', '22 degrees', etc.). Devotees cannot understand degrees. Instead, refer ONLY to the Bhava (House 1 to 12), Rashi name, or Navamsha.`,
    isStruggling
      ? `- COMPASSIONATE CONSOLATION: ${name} is traversing a demanding karmic phase. Acknowledge their silent burdens with genuine empathy. Frame challenges not as punishment, but as sacred karmic refinement leading to lasting spiritual strength.`
      : ``,
    isChildless
      ? `- SACRED TENDERNESS: ${name} and their partner hold a quiet prayer for progeny in their hearts. Treat this topic with sacred reverence, divine hope, and Atma Linga blessings. NEVER write cold or clinical observations.`
      : ``,
    ageYears >= 60
      ? `- REVERED ELDER BLESSING: Acknowledge ${name}'s lifetime of noble tapas, sacrifices for family, and spiritual wisdom. Frame the future as serene fulfillment and spiritual peace.`
      : ``,
    ageYears < 22 && ageYears >= 12
      ? `- YOUTH INSPIRATION: Guide ${name} with clarity, focus, emotional balance, and steadfast determination.`
      : ``
  ].filter(Boolean).join("\n");
};

/**
 * The shared factual block. Names are already localised, so the model copies
 * rather than translates them.
 */
export const buildChartFacts = (input: PremiumPromptInput): string => {
  const { lang } = input;

  const natal = input.natalPlanets
    .map(p => {
      const flags: string[] = [];
      if (p.retrograde) flags.push("retrograde (Vakra)");
      if (p.debilitated) flags.push("debilitated (Neecha)");
      if (p.exalted) flags.push("exalted (Ucha)");
      if (p.isVargottama) flags.push("Vargottama (same rashi in D1 and D9 Navamsha - high royal dignity)");
      if (p.isCombust) flags.push("combust (Astangata by Surya)");
      if (p.dignityLabel) flags.push(`dignity: ${p.dignityLabel}`);
      const navamshaStr = p.navamshaRashiIndex !== undefined ? ` | Navamsha: ${rashiName(p.navamshaRashiIndex, lang)}` : "";
      const suffix = flags.length ? ` [${flags.join(", ")}]` : "";
      return `  ${grahaName(p.graha, lang)} | Rashi: ${rashiName(p.rashiIndex, lang)} | Bhava: ${p.house}${navamshaStr}${suffix}`;
    })
    .join("\n");

  const transits = input.transits
    .map(
      t =>
        `  ${grahaName(t.graha, lang)} | ${rashiName(t.rashiIndex, lang)} | ${t.houseFromMoon} from the birth Chandra rashi`
    )
    .join("\n");

  const yogas = input.engineYogas.length
    ? input.engineYogas.map(y => `  ${y.name}: ${asText(y.significance)}`).join("\n")
    : "  (the engine found no classical yoga worth naming)";

  const doshas = input.engineDoshas.length
    ? input.engineDoshas.map(d => `  ${d.name}: ${asText(d.significance)}`).join("\n")
    : "  (the engine found no classical dosha worth naming)";

  const dashaLine =
    input.mahaLord && input.bhuktiLord
      ? `${grahaName(input.mahaLord, lang)} Mahadasha, and inside it ${grahaName(input.bhuktiLord, lang)} Bhukti` +
        (input.bhuktiEndsAtAge !== null
          ? ` (this Bhukti runs until about age ${input.bhuktiEndsAtAge.toFixed(1)})`
          : "")
      : "(not available)";

  return [
    "CHART FACTS — these are computed, not guessed. Never contradict them.",
    "Names below are already written in the target language. Copy them exactly as spelled here.",
    "",
    `Person: ${input.name}`,
    `Gender: ${input.gender || "Male"}`,
    `Age now: ${Math.floor(input.ageYears)}`,
    `Marital status: ${input.maritalStatus || "general"}`,
    `Children status: ${input.hasChildren || "general"}`,
    `Lagna: ${rashiName(input.lagnaRashiIndex, lang)}`,
    `Chandra rashi: ${rashiName(input.moonRashiIndex, lang)}`,
    `Janma nakshatra: ${nakshatraName(input.moonNakshatraIndex, lang)}${input.moonPada ? ` (Pada ${input.moonPada})` : ""}`,
    `Surya rashi: ${rashiName(input.sunRashiIndex, lang)}`,
    ...(input.tithiName ? [`Janma Tithi: ${input.tithiName}`] : []),
    ...(input.weekdayName ? [`Janma Vaara (Weekday): ${input.weekdayName}`] : []),
    ...(input.yogaName ? [`Janma Nitya Yoga: ${input.yogaName}`] : []),
    ...(input.karanaName ? [`Janma Karana: ${input.karanaName}`] : []),
    ...(input.dagdhaRashis ? [`Dagdha (Shunya) Rashis: ${input.dagdhaRashis}`] : []),
    ...(input.todayTithiName ? [`Transit (Today) Tithi: ${input.todayTithiName}`] : []),
    ...(input.todayVaaraName ? [`Transit (Today) Vaara: ${input.todayVaaraName}`] : []),
    ...(input.todayMoonNakshatra ? [`Transit (Today) Moon Nakshatra: ${input.todayMoonNakshatra}`] : []),
    ...(input.taraBalaName ? [`Navatara Chakra (Tara Bala): ${input.taraBalaName}`] : []),
    ...(input.chandraBalaHouse !== undefined ? [`Transit Chandra Bala: House ${input.chandraBalaHouse} from Janma Moon`] : []),
    ...(input.isManglikCancelled ? [`Kuja Dosha Status: CANCELLED (${input.manglikCancellationReason})`] : []),
    ...(input.dashaSandhiActive ? [`Dasha Sandhi: ACTIVE TRANSITION (${input.dashaSandhiDetails || "within 9 months of transition"})`] : []),
    ...(input.maandiConjunctions && input.maandiConjunctions.length ? [`Maandi Conjunctions: ${input.maandiConjunctions.join(", ")}`] : []),
    "",
    "Graha placements at birth (graha | rashi | bhava | navamsha):",
    natal,
    "",
    "Where the grahas are moving right now (graha | rashi | house counted from the birth Chandra rashi):",
    transits || "  (not available)",
    "",
    `Running period: ${dashaLine}`,
    "",
    "Yogas the engine detected:",
    yogas,
    "",
    "Doshas the engine detected:",
    doshas,
    "",
    `Current life phase per the engine: ${input.lifePhase}`,
    `Overall tone: ${input.overallTone}`,
    `Career note: ${input.careerNote}`,
    `Money note: ${input.financeNote}`,
    "",
    "DIGNITY & VARGOTTAMA NARRATIVE MANDATE:",
    "- For every exalted planet, celebrate its royal empowerment in that Bhava.",
    "- For every debilitated planet, explain its karmic lesson AND divine compensating factors.",
    "- For Vargottama planets, highlight their scriptural stability and unshakable willpower.",
    "- For combust planets, describe how Surya's blazing luminescence internalizes their creative power.",
    "- STRICT NO-DEGREE MANDATE: Do NOT mention any numerical degrees or degree symbols anywhere in the reading."
  ].join("\n");
};

const header = (input: PremiumPromptInput, sectionKey: string, persona: string): string =>
  [
    persona,
    "",
    buildEmotionalAnchor(input),
    "",
    languageContract(input.lang),
    "",
    accuracyContract(input),
    "",
    noRepeatContract(sectionKey, input.runId),
    "",
    buildChartFacts(input),
    ""
  ].join("\n");

const JSON_RULE =
  "Return ONLY valid JSON. No markdown fences, no commentary before or after the JSON.";

/**
 * Distinct personas per chapter. Two chapters written by the "same" voice on
 * the same data come out nearly identical, so each one gets its own stance.
 */
export const buildPremiumPrompts = (input: PremiumPromptInput) => {
  const { lang } = input;
  const charQuestion = tp("characteristicsQuestion", lang);
  const secretQuestion = tp("darkSecretQuestion", lang);
  const phaseQuestion = tp("currentPhaseQuestion", lang);
  const marQuestion = getDevoteeQuestionForCategory("marriage", lang, input.ageYears);
  const chdQuestion = getDevoteeQuestionForCategory("children", lang, input.ageYears);
  const carQuestion = getDevoteeQuestionForCategory("career", lang, input.ageYears);
  const wlhQuestion = getDevoteeQuestionForCategory("wealth", lang, input.ageYears);
  const hltQuestion = getDevoteeQuestionForCategory("health", lang, input.ageYears);

  const dashaLine =
    input.mahaLord && input.bhuktiLord
      ? `${grahaName(input.mahaLord, lang)} Mahadasha, and inside it ${grahaName(input.bhuktiLord, lang)} Bhukti`
      : "(not available)";

  const roadmapText = input.roadmap
    .slice(0, 6)
    .map(r => `  ${r.month}: ${r.prediction}`)
    .join("\n");

  const shaniTransit = input.transits.find(t => t.graha === "Saturn");
  const guruTransit = input.transits.find(t => t.graha === "Jupiter");

  const soulMirror = `${header(
    input,
    "soulMirror",
    "You are a revered master astrologer of Baggona Panchanga rooted in Sri Kshetra Gokarna revealing the Sacred Soul Mirror and 3 Sovereign Truths of the Native's Soul based on birth chart placements."
  )}
Extra material for this chapter:
- Native's Lagna: ${rashiName(input.lagnaRashiIndex, lang)}
- Natal Moon Sign: ${rashiName(input.moonRashiIndex, lang)}
- Nakshatra: ${nakshatraName(input.moonNakshatraIndex, lang)}
- Running Period: ${dashaLine}

CRITICAL 100% SHASTRIYA ACCURACY REQUIREMENT:
Synthesize Chapter 1: The Sacred Soul Mirror & 3 Sovereign Truths of the Native's Soul.
MUST BE 100% DERIVED FROM NATIVE'S EXACT LAGNA (${rashiName(input.lagnaRashiIndex, lang)}), MOON (${rashiName(input.moonRashiIndex, lang)}), NAKSHATRA (${nakshatraName(input.moonNakshatraIndex, lang)}), AND BHAVA PLACEMENTS. ZERO generic statements.
Write THREE (3) profound, deep, culturally revered truth paragraphs (each paragraph minimum 150 characters, at least 5-6 full lines).
- Truth 1 (Outer Persona vs Inner Core): Contrast the strong, capable outer demeanor of ${rashiName(input.lagnaRashiIndex, lang)} Lagna with the tender, self-sacrificing inner emotional sanctuary of ${rashiName(input.moonRashiIndex, lang)} Moon.
- Truth 2 (Moral Integrity & Boundary): Explain the native's sacred boundary of trust—forgiving innocent mistakes readily, but strictly intolerant of intentional betrayal, fraud, or loss of dignity.
- Truth 3 (Poorvapunya Shield & Sri Kshetra Gokarna Divine Grace): Reveal how hidden meritorious deeds (Poorvapunya) and the divine grace of Sri Kshetra Gokarna's Mahabaleshwara and Mukhyaprana miraculously rescue and shield the native during life's 11th hour.

${JSON_RULE}
{"truth1Title": "evocative title", "truth1Text": "in-depth paragraph of at least 6-8 lines", "truth2Title": "evocative title", "truth2Text": "in-depth paragraph of at least 6-8 lines", "truth3Title": "evocative title", "truth3Text": "in-depth paragraph of at least 6-8 lines"}`;

  const characteristics = `${header(
    input,
    "characteristics",
    "You are an authoritative Vedic astrologer writing a 100% mathematically accurate personality analysis strictly grounded in computed chart placements."
  )}
DEVOTEE INQUEST QUESTION TO DIRECTLY ADDRESS AND ANSWER:
"${charQuestion}"

Extra material for this chapter only:
Shadow side found by the engine: ${input.shadowSelf}
Karmic pattern found by the engine: ${input.karmicBaggage}

CRITICAL ACCURACY & 4-PARAGRAPH STRUCTURAL MANDATE:
Write STRICTLY FOUR (4) FULL, SUBSTANTIAL PARAGRAPHS answering the devotee's heartfelt question above.
STRICT LENGTH RULE: EACH PARAGRAPH MUST CONTAIN AT LEAST 5 TO 6 FULL, SUBSTANTIAL LINES OF TEXT (minimum 20 lines total for the section).
MUST BE 100% MATHEMATICALLY ACCURATE to the birth chart above. ZERO generic statements or unverified claims.
- Paragraph 1 (5–6 lines): Synthesis of Lagna (${rashiName(input.lagnaRashiIndex, lang)}) and Chandra Rashi (${rashiName(input.moonRashiIndex, lang)}), alongside Janma Nakshatra (${nakshatraName(input.moonNakshatraIndex, lang)}${input.moonPada ? ` Pada ${input.moonPada}` : ""}) with its presiding Vedic deity archetype. Detail core temperament, sattvic qualities, instinctive reactions, and constitutional strengths.
- Paragraph 2 (5–6 lines): Lagna lord (Lagnesha) placement, dignity (exalted, debilitated, swakshetra, Vargottama, combust), and aspects/occupants impacting the 1st house. Explain how this shapes physical presence, vitality, moral conviction, and worldly posture.
- Paragraph 3 (5–6 lines): Worldly behavior, natural leadership instincts, decision-making style under running ${dashaLine}${input.dashaSandhiActive ? ", and Dasha Sandhi transition guidance" : ""}. Address how the native balances personal ideals with external responsibilities.
- Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED PERSONALITY SHIELD & DIVINE GRACE (e.g. 【ವ್ಯಕ್ತಿತ್ವ ರಕ್ಷಾ ಕವಚ & ದೈವಿಕ ಅನುಗ್ರಹ ಮಾರ್ಗ】 / 【Personality Shield & Divine Grace Guidance】): Provide the native's personal protective mantra, sacred daily conduct, and divine blessings from Sri Kshetra Gokarna Mahabaleshwara and Mukhyaprana to fortify their vital aura and spiritual radiance.

${JSON_RULE}
{"characteristics":[{"impact":"paragraph one (5-6 lines)\\n\\nparagraph two (5-6 lines)\\n\\nparagraph three (5-6 lines)\\n\\nparagraph four starting with 【...】 (5-6 lines)"}]}`;

  const darkSecret = input.ageYears < 8 ? "" : `${header(
    input,
    "darkSecret",
    "You are an authoritative Vedic astrologer revealing the hidden soul pattern strictly based on 8th/12th house placements and karmic planets."
  )}
DEVOTEE INQUEST QUESTION TO DIRECTLY ADDRESS AND ANSWER:
"${secretQuestion}"

Extra material for this chapter only:
Shadow: ${input.shadowSelf}
Karma: ${input.karmicBaggage}
${input.affairNote}

CRITICAL ACCURACY & 4-PARAGRAPH DEEP EMOTIONAL CONNECTION REQUIREMENT:
Reveal the single deepest hidden truth of THIS chart — the niguda rahasya (ನಿಗೂಢ ರಹಸ್ಯ - hidden subconscious reality).
STRICT LENGTH RULE: Write STRICTLY FOUR (4) FULL, SUBSTANTIAL PARAGRAPHS, and EACH PARAGRAPH MUST CONTAIN AT LEAST 5 TO 6 FULL, SUBSTANTIAL LINES OF TEXT (minimum 20-24 lines total for the section).
MUST BE 100% MATHEMATICALLY ACCURATE to the 8th/12th house placements, Rahu/Ketu/Saturn karmic influences, running ${dashaLine}, and planetary transits in THIS chart.

DEEP EMOTIONAL RESONANCE MANDATE:
Speak directly to ${input.name}. Highlight the reality of what is happening inside them:
Even though they smile outside, maintain a strong exterior for their family, and appear composed in society, unveil the unspoken emotional struggles, private loneliness, silent sacrifices, and internal vulnerabilities they carry alone and have never disclosed to anyone. When they read this, they must feel profoundly understood: "Yes, this is the nigudha rahasya I have kept locked inside with me, which nobody else sees!"
- Paragraph 1 (5–6 lines): The hidden mask of fortitude vs inner vulnerability. Emotional burdens, silent fatigue, and secret wounds tied directly to named 8th/12th house placements above.
- Paragraph 2 (5–6 lines): Conscious secrets, unspoken fears, and concealed anxieties. What ${input.name} hides from everyone in family, workplace, and social life—the fear of letting others down, unacknowledged heartbreak, or the exhausting burden of always having to be the strong one.
- Paragraph 3 (5–6 lines): Rahu-Ketu karmic axis and past-life debt (Rinanubandha). Feeling unappreciated, invisible, or carrying emotional contracts from past lives despite selflessly supporting others, under running ${dashaLine}.
- Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED INNER CATHARSIS & ATMA LINGA DIVINE SHIELD (e.g. 【ಅಂತರಂಗ ಶುದ್ಧಿ & ಆತ್ಮಲಿಂಗ ದೈವಿಕ ರಕ್ಷಾ ಕವಚ】 / 【Inner Catharsis & Atma Linga Divine Shield】): Compassionate spiritual catharsis, inner reconciliation, and the transformative blessing from Lord Gokarna Mahabaleshwara (sacred Atma Linga) and Lord Mukhyaprana required to dissolve these silent fears and restore profound peace of mind.
Do not moralise, do not frighten, end on what can be healed and transformed.

${JSON_RULE}
{"darkSecret":[{"impact":"paragraph one (5-6 lines)\\n\\nparagraph two (5-6 lines)\\n\\nparagraph three (5-6 lines)\\n\\nparagraph four starting with 【...】 (5-6 lines)"}]}`;

  const yogas = `${header(
    input,
    "yogas",
    "You are an authoritative Vedic scholar of classical yoga formations explaining planetary blessings with 100% mathematical precision and profound depth."
  )}
CRITICAL 100% SHASTRIYA ACCURACY & STRUCTURAL REQUIREMENT:
MUST BE 100% MATHEMATICALLY ACCURATE to the graha yogas in THIS chart. ZERO generic statements or unverified yogas.
Take the yogas listed in the chart facts above (or identify the 2 to 3 strongest genuine yogas from the placements).
For EACH yoga in the 'yogas' array, the 'impact' field MUST CONTAIN EXACTLY TWO (2) GENEROUS PARAGRAPHS separated by '\\n\\n'.
STRICT LENGTH RULE: EACH PARAGRAPH MUST BE AT LEAST 4 TO 5 FULL, SUBSTANTIAL LINES OF TEXT (minimum 250+ characters per paragraph, minimum 10 lines total per yoga).

- PARAGRAPH 1 (What the Yoga is & Classical Astrological Explanation):
  Explain what this specific Yoga is, which exact grahas and houses in THIS chart form it, the classical scriptural/Parashari definition, and the cosmic principles behind this fortunate alignment.

- PARAGRAPH 2 (What this Yoga is Currently Doing in Their Life):
  Explain what this Yoga is actively doing in their life right now at age ${Math.floor(input.ageYears)}, during their running ${dashaLine}, and under current transits. Detail concrete real-world effects: intellectual clarity, career elevation, financial protection, mental resilience, and social respect.

${JSON_RULE}
{"yogas":[{"name":"Name of Yoga","impact":"Paragraph 1: Detailed explanation of what the yoga is (at least 4-5 lines)\\n\\nParagraph 2: Detailed explanation of what this yoga is currently doing in their life (at least 4-5 lines)"}]}`;

  const doshas = `${header(
    input,
    "doshas",
    "You are an empathetic Vedic master who analyzes planetary afflictions (doshas) with 100% scriptural precision and provides practical Gokarna remedies."
  )}
CRITICAL 100% SHASTRIYA ACCURACY & DOSHA RESOLUTION REQUIREMENT:
MUST BE 100% MATHEMATICALLY ACCURATE to the planetary afflictions in THIS chart.
Native Age: ${Math.floor(input.ageYears)} years old. Marital Status: ${(input.maritalStatus || "general").toUpperCase()}.
${input.isManglikCancelled ? `IMPORTANT SCRIPTURAL KUJA CANCELLATION (Apavada): Mars affliction is CANCELLED in this chart (${input.manglikCancellationReason}). You MUST NOT diagnose active Kuja Dosha. If analyzing Mars, explain that Parashari cancellation principles render it neutralized, completely removing matrimonial anxiety.` : ""}
${(input.maritalStatus || "general") === "married" ? "IMPORTANT: The native is ALREADY MARRIED. For Kuja/Manglik Dosha or any relational afflictions, you MUST NEVER write 'delay in marriage', 'impediments in finding a partner', or 'difficulty getting married'. Instead, frame it strictly as preserving marital harmony, overcoming temperamental friction, mutual respect, and domestic bliss." : (input.maritalStatus || "general") === "unmarried" ? "The native is UNMARRIED. For Kuja/Manglik Dosha, discuss thoughtful timing, avoiding hasty decisions, and astrological compatibility for marriage alliances." : ""}
Take the doshas listed in the chart facts above (or identify the 1 to 2 principal planetary afflictions/karmic challenges from the placements).
For EACH dosha in the 'doshas' array:
1. The 'impact' field MUST CONTAIN EXACTLY TWO (2) GENEROUS PARAGRAPHS separated by '\\n\\n'.
STRICT LENGTH RULE: EACH PARAGRAPH MUST BE AT LEAST 4 TO 5 FULL, SUBSTANTIAL LINES OF TEXT (minimum 250+ characters per paragraph, minimum 10 lines total per dosha).

- PARAGRAPH 1 (What the Dosha is & Classical Astrological Explanation):
  Explain what this specific Dosha/affliction is, which exact grahas, houses, or planetary conflicts in THIS chart create it, and the classical karmic mechanism behind it.

- PARAGRAPH 2 (What this Dosha is Currently Doing in Their Life):
  Explain what this Dosha is actively doing in their life right now at age ${Math.floor(input.ageYears)}, during their running ${dashaLine}, and under current transits. Detail concrete daily experiences: mental friction, emotional restlessness, delays in specific ventures, relationship tests, or energy drains, without causing fear.

2. The 'remedy' field: Provide a clear, practical Vedic remedy, mantra, or sacred temple seva (e.g., Kukke Subramanya, Gokarna Mahabaleshwara) tailored to pacify this specific dosha. Write purely in the target language without English abbreviations or colons.

${JSON_RULE}
{"doshas":[{"name":"Name of Dosha","impact":"Paragraph 1: Detailed explanation of what the dosha is (at least 4-5 lines)\\n\\nParagraph 2: Detailed explanation of what this dosha is currently doing in their life (at least 4-5 lines)","remedy":"Practical Vedic remedy"}]}`;

  const gochara = `${header(
    input,
    "gochara",
    "You are an authoritative Vedic astrologer evaluating live planetary transits against the native's Janma Chandra Rashi with 100% astronomical accuracy and deep psychological insight."
  )}
CRITICAL 100% TRANSIT ACCURACY REQUIREMENT:
MUST BE 100% MATHEMATICALLY ACCURATE to the live celestial transits counted from Janma Chandra Rashi (${rashiName(input.moonRashiIndex, lang)}). Cover Saturn (Shani), Jupiter (Guru), and Rahu-Ketu nodal axis transits.
For EACH transit card in the 'gochara' array:
1. The 'impact' field MUST CONTAIN EXACTLY TWO (2) GENEROUS PARAGRAPHS separated by '\\n\\n'.
STRICT LENGTH RULE: EACH PARAGRAPH MUST BE AT LEAST 4 TO 5 FULL, SUBSTANTIAL LINES OF TEXT (minimum 250+ characters per paragraph, minimum 10 lines total per transit).

- PARAGRAPH 1 (What the Transit is & Astronomical Movement):
  Explain the specific celestial transit of this planet (which house it is transiting from Janma Chandra Rashi), the classical nature of this transit house, and its planetary energy.

- PARAGRAPH 2 (What this Transit is Currently Doing in Their Life):
  Explain what this transit is actively doing in their daily life right now. Detail concrete everyday manifestations: current emotional climate, workplace demands, domestic atmosphere, financial discipline, health habits, or personal decisions.

2. The 'remedy' field: Provide one practical Vedic remedy to balance and harmonize this transit.

The 'name' and 'remedy' fields must be in the target language native script (${input.lang}).

${JSON_RULE}
{"gochara":[{"name":"Name of Transit","impact":"Paragraph 1: Detailed explanation of what the transit is (at least 4-5 lines)\\n\\nParagraph 2: Detailed explanation of what this transit is currently doing in their life (at least 4-5 lines)","remedy":"Practical Vedic remedy"}]}`;

  const timeline = `${header(
    input,
    "timeline",
    "You are an intuitive Vedic astrologer laying out a personalized 6-month journey map for " + input.name + "."
  )}
Janma Kundali Foundation:
- Janma Lagna: ${rashiName(input.lagnaRashiIndex, lang)}
- Janma Rashi (Moon Sign): ${rashiName(input.moonRashiIndex, lang)}
- Active Planetary Era: ${dashaLine}
- Live Gochara Transits: Jupiter transit in house ${guruTransit?.houseFromMoon ?? 'N/A'} from Moon; Saturn transit in house ${shaniTransit?.houseFromMoon ?? 'N/A'} from Moon.

Engine roadmap for the coming months:
${roadmapText || "  (not available)"}

CRITICAL 100% TIMELINE ACCURACY & PERSONALIZATION REQUIREMENT:
Connect each month directly with ${input.name}'s living reality at age ${Math.floor(input.ageYears)}.
DO NOT give generic, templated, or repetitive monthly predictions. Each month must be 100% uniquely tailored to ${input.name}'s exact Janma Kundali (Lagna: ${rashiName(input.lagnaRashiIndex, lang)}, Moon: ${rashiName(input.moonRashiIndex, lang)}), running ${dashaLine}, and transit influences.
Provide EXACTLY SIX (6) entries in the 'timeline' array — one entry for EACH of the 6 months listed in the roadmap above.
For EACH month entry:
- 'dateRange': Write the month name and year in the target language native script (${input.lang}).
- 'impact': Write ONE generous, detailed paragraph (at least 5-6 sentences, approx. 350-450 characters) detailing concrete, relatable events happening in their life during that month (financial expenses/relief, family conversations, workplace dynamics, wellness vigilance, or spiritual moments). Avoid vague jargon. Speak directly to 'you'.
Ensure all 6 months are covered sequentially without skipping any month.

${JSON_RULE}
{"timeline":[{"dateRange":"month and year in target script","impact":"one long detailed paragraph"}]}`;

  const maritalSel = input.maritalStatus || (input as any).marital || "general";
  const childrenSel = input.hasChildren || (input as any).childrenStatus || "general";

  const currentPhase = `${header(
    input,
    "currentPhase",
    "You are a deeply empathetic Vedic astrologer and psychological counselor speaking directly to " + input.name + " with profound compassion, warmth, and intimate personal insight."
  )}
DEVOTEE INQUEST QUESTION TO DIRECTLY ADDRESS AND ANSWER:
"${phaseQuestion}"

CRITICAL 100% LIVING REALITY & ACCURACY REQUIREMENT:
MUST BE 100% GROUNDED in computed placements, age, dasha, and live transits.
You MUST connect with ${input.name} on a deeply personal, emotional level. Address them directly as 'you' (and greet them by name, ${input.name}).
Tell them EXACTLY WHAT IS HAPPENING IN THEIR LIFE RIGHT NOW at age ${Math.floor(input.ageYears)} (${input.gender || 'Male'}, ${maritalSel}, ${childrenSel}), grounded strictly in their running ${dashaLine}, Lagna (${rashiName(input.lagnaRashiIndex, lang)}), Moon (${rashiName(input.moonRashiIndex, lang)}), and live Gochara transits.

DO NOT write detached textbook astrology or vague abstractions. Describe their living reality, daily emotions, household atmosphere, and workplace/financial circumstances!
${input.dashaSandhiActive ? `CRITICAL DASHA SANDHI GUIDANCE: The native is currently traversing an active Dasha Sandhi transition (${input.dashaSandhiDetails || "within 9 months of major dasha change"}). In Paragraph 1 and Paragraph 4, explicitly incorporate compassionate guidance about this major planetary transition: counsel measured patience, avoiding impulsive career or life gambles, and prioritizing mental grounding while cosmic currents realign.` : ""}

Write EXACTLY FOUR (4) FULL, DETAILED PARAGRAPHS (EXPANSIVE AND DEEPLY PERSONAL):

- Paragraph 1 (Exact Daily Life Circumstances Happening Right Now):
  Describe their concrete daily reality today. What is happening in their household, career/finances, and daily routine?
  ${input.ageYears >= 60
    ? `Since ${input.name} is a respected elder (age ${Math.floor(input.ageYears)}), focus on their transition away from routine rat-race competition, bodily vitality and health routines, concern for children/grandchildren settling down, household legacy, and desire for an orderly, peaceful home environment.`
    : input.ageYears < 23
    ? `Since ${input.name} is a youth/student (age ${Math.floor(input.ageYears)}), focus on their academic workload, exam pressures, career direction dilemmas, search for personal identity, and emotional expectations from family and peers.`
    : `Since ${input.name} is an adult (age ${Math.floor(input.ageYears)}), focus on their heavy daily responsibilities, balancing career progression with domestic duties, financial commitments/expenditures, ${maritalSel === 'married' ? (childrenSel === 'no_children' ? 'nurturing deep marital harmony, standing as emotional anchors for each other, and holding shared hopes for family expansion' : 'nurturing marital harmony and children\'s needs') : 'pursuing vocational stability and personal life settlement'}, and feeling that the family\'s stability relies on their shoulders.`
  }
  Tie this directly to the energy of running ${dashaLine}.

- Paragraph 2 (Core Emotional State & Mental Weather Happening Right Now):
  Acknowledge their exact feelings right now. Validate their silent emotional burdens, moments of fatigue, stress, or excitement.
  Explain how live planetary transits (Saturn's transit from Moon, Jupiter's transit, Rahu-Ketu) are actively coloring their thoughts. If experiencing Sade Sati, Ashtama Shani, or challenging transits, acknowledge the delays, heavy workload, or tests of patience without creating fear. If blessed with Guru Bala, highlight the inner reassurance and divine protection sheltering them.

- Paragraph 3 (Subconscious Thoughts & Hidden Desires Right Now):
  Unveil what is happening beneath their outward mask. What are their secret thoughts, private doubts, unexpressed yearnings, or internal motivations driving their current decisions?
  ${input.ageYears >= 60
    ? `Describe their soul's deep longing for spiritual serenity, authentic family appreciation, and freedom from unnecessary domestic friction.`
    : input.ageYears < 23
    ? `Describe their private craving for genuine encouragement, clarity of purpose, and release from self-doubt.`
    : `Describe their silent anxiety about long-term financial security, craving for genuine appreciation from partner/family, and yearning for a peaceful life where they don't have to carry every burden alone.${maritalSel === 'married' && childrenSel === 'no_children' ? ' Acknowledge also their tender private prayers and shared hopes with their spouse regarding welcoming a child into their life.' : ''}`
  }

- Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DASHA-GOCHARA RELIEF SHIELD & SRI GOKARNA SANCTUARY SEVA (e.g. 【ಪ್ರಸ್ತುತ ದಶಾ-ಗೋಚಾರ ಸಂಕಷ್ಟ ನಿವಾರಣಾ ಕವಚ & ಶ್ರೀ ಸನ್ನಿಧಾನ ಸೇವೆ】 / 【Dasha-Gochara Relief Shield & Sri Gokarna Sanctuary Grace】):
  Provide wise, actionable guidance on the exact mental attitude to cultivate during this phase. Give 2 practical Vedic remedies (daily dawn prayer, lighting a sacred lamp at dusk, specific mantra japa or charity) and Sri Kshetra Gokarna Mahabaleshwara and Mukhyaprana sankalpa to pacify planetary friction and invite peace, prosperity, and divine grace.

${JSON_RULE}
{"currentPhase":[{"impact":"paragraph 1\n\nparagraph 2\n\nparagraph 3\n\nparagraph 4"}]}`;

  const lagnaIdx = input.lagnaRashiIndex !== null ? input.lagnaRashiIndex : 0;

  const RASHI_LORD_GRAHAS: GrahaKey[] = [
    "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
    "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"
  ];

  const formatPlacementText = (p: NatalPlacement | undefined): string => {
    if (!p) return lang === "kn" ? "ಕುಂಡಲಿಯಲ್ಲಿ ಸುಸ್ಥಿತಿಯಲ್ಲಿದ್ದು" : lang === "hi" ? "कुंडली में सुस्थित होकर" : lang === "te" ? "కుండలిలో సుస్థితిలో ఉండి" : lang === "ta" ? "ஜாதகத்தில் சுப ஸ்தானத்தில் அமர்ந்து" : "favorably placed in chart";
    const sign = rashiName(p.rashiIndex, lang);
    const traits: string[] = [];
    if (p.exalted) traits.push(lang === "kn" ? "ಉಚ್ಚ ಸ್ಥಿತಿ (Exalted)" : lang === "hi" ? "उच्च अवस्था (Exalted)" : lang === "te" ? "ఉచ్ఛ స్థితి (Exalted)" : lang === "ta" ? "உச்ச நிலை (Exalted)" : "Exalted");
    if (p.debilitated) traits.push(lang === "kn" ? "ನೀಚ ಸ್ಥಿತಿ (Debilitated)" : lang === "hi" ? "नीच अवस्था (Debilitated)" : lang === "te" ? "నీచ స్థితి (Debilitated)" : lang === "ta" ? "நீச நிலை (Debilitated)" : "Debilitated");
    if (p.retrograde) traits.push(lang === "kn" ? "ವಕ್ರ ಗತಿ (Retrograde)" : lang === "hi" ? "वक्र गति (Retrograde)" : lang === "te" ? "వక్ర గతి (Retrograde)" : lang === "ta" ? "வக்ர நிலை (Retrograde)" : "Retrograde");
    if (p.isVargottama) traits.push(lang === "kn" ? "ವರ್ಗೋತ್ತಮ (Vargottama - D1 & D9 same rashi)" : lang === "hi" ? "वर्गोत्तम (Vargottama)" : lang === "te" ? "వర్గోత్తమం (Vargottama)" : lang === "ta" ? "வர்கோத்தமம் (Vargottama)" : "Vargottama");
    if (p.isCombust) traits.push(lang === "kn" ? "ಅಸ್ತಂಗತ (Combust by Sun)" : lang === "hi" ? "अस्तंगत (Combust)" : lang === "te" ? "అస్తంగతం (Combust)" : lang === "ta" ? "அஸ்தமனம் (Combust)" : "Combust");
    if (p.dignityLabel) traits.push(p.dignityLabel);
    if (p.navamshaRashiIndex !== undefined && p.navamshaRashiIndex >= 0 && p.navamshaRashiIndex <= 11) {
      const navSign = rashiName(p.navamshaRashiIndex, lang);
      traits.push(`Navamsha: ${navSign}`);
    }
    const traitStr = traits.length ? ` [${traits.join(", ")}]` : "";

    if (lang === "kn") return `${sign} ರಾಶಿಯಲ್ಲಿ ${p.house}ನೇ ಮನೆಯಲ್ಲಿದ್ದು${traitStr}`;
    if (lang === "hi") return `${sign} राशि में ${p.house}वें भाव में स्थित होकर${traitStr}`;
    if (lang === "te") return `${sign} రాశిలో ${p.house}వ స్థానంలో స్థితుడై${traitStr}`;
    if (lang === "ta") return `${sign} ராசியில் ${p.house}ஆம் பாவத்தில் அமர்ந்து${traitStr}`;
    return `in ${sign} in house ${p.house}${traitStr}`;
  };

  const getHouseInfo = (houseNum: number) => {
    const signIdx = (lagnaIdx + houseNum - 1) % 12;
    const sign = rashiName(signIdx, lang);
    const lord = RASHI_LORD_GRAHAS[signIdx];
    const lordStr = grahaName(lord, lang);
    const lordPlacement = input.natalPlanets.find(p => p.graha === lord);
    const occupants = input.natalPlanets.filter(p => p.house === houseNum).map(p => grahaName(p.graha, lang));
    const lordWhere = formatPlacementText(lordPlacement);
    const occStr = occupants.length
      ? occupants.join(", ")
      : (lang === "kn" ? "ಯಾವ ಗ್ರಹಗಳೂ ಇರುವುದಿಲ್ಲ" : lang === "hi" ? "कोई ग्रह नहीं" : lang === "te" ? "గ్రహాలు లేవు" : lang === "ta" ? "கிரகங்கள் இல்லை" : "no planets occupying");
    return { signIdx, sign, lord, lordStr, lordWhere, occStr };
  };

  const h1 = getHouseInfo(1);
  const h2 = getHouseInfo(2);
  const h5 = getHouseInfo(5);
  const h6 = getHouseInfo(6);
  const h7 = getHouseInfo(7);
  const h8 = getHouseInfo(8);
  const h10 = getHouseInfo(10);
  const h11 = getHouseInfo(11);
  const h12 = getHouseInfo(12);

  const marsPlacement = input.natalPlanets.find(p => p.graha === "Mars");
  const isManglik = marsPlacement && [1, 2, 4, 7, 8, 12].includes(marsPlacement.house);
  const venusPlacement = input.natalPlanets.find(p => p.graha === "Venus");
  const jupiterPlacement = input.natalPlanets.find(p => p.graha === "Jupiter");
  const saturnPlacement = input.natalPlanets.find(p => p.graha === "Saturn");
  const moonPlacement = input.natalPlanets.find(p => p.graha === "Moon");

  const directionsByElement = ["East", "South", "West", "North", "East", "South", "West", "North", "East", "South", "West", "North"];
  const spouseDirection = directionsByElement[h7.signIdx] || "East";

  const isGuruBala = guruTransit && [2, 5, 7, 9, 11].includes(guruTransit.houseFromMoon);

  const anatomicalVulnerabilitiesBySign: Record<number, string> = {
    0: "head, ocular strain, forehead tension, bodily heat / Pitta fluctuations",
    1: "throat, neck stiffness, vocal cords, thyroid / tonsil sensitivities",
    2: "respiratory airways, shoulders, arm strain, nervous system exhaustion",
    3: "stomach, digestion fire (Jatharagni), chest fullness, water retention, emotional stress",
    4: "heart rhythm, spine / upper back tension, circulation, eye sensitivity under fatigue",
    5: "intestines, digestive assimilation, lower abdomen sensitivity, nervous exhaustion",
    6: "kidneys, lumbar / lower back balance, skin sensitivities, hormonal equilibrium",
    7: "pelvic region, excretory rhythm, sudden body heat spikes, regenerative stamina",
    8: "hips, thighs, liver metabolism, sciatic nerve fatigue, arterial circulation",
    9: "knees, bone density, joint stiffness, chronic Vata / cold sensitivities",
    10: "calves, ankles, circulatory flow, nervous strain, leg fatigue after long standing",
    11: "feet, lymphatic balance, lymphatic sluggishness, sleep restlessness"
  };
  const lagnaAnatomy = anatomicalVulnerabilitiesBySign[h1.signIdx] || "vital constitution and physical stamina";
  const rogaAnatomy = anatomicalVulnerabilitiesBySign[h6.signIdx] || "digestive and metabolic balance";

  const isInfant = input.ageYears < 5;
  const isEarlyChild = input.ageYears >= 5 && input.ageYears < 12;
  const isChild = input.ageYears < 12;
  const isEarlyYouth = input.ageYears >= 12 && input.ageYears < 17;
  const isCollegeYouth = input.ageYears >= 17 && input.ageYears < 22;
  const isYouth = input.ageYears >= 12 && input.ageYears < 22;
  const isYoungAdult = input.ageYears >= 22 && input.ageYears < 36;
  const isMidAdult = input.ageYears >= 36 && input.ageYears < 50;
  const isMatureAdult = input.ageYears >= 50 && input.ageYears < 60;
  const isSenior = input.ageYears >= 60 && input.ageYears < 75;
  const isElder = input.ageYears >= 75;
  const isElderSenior = input.ageYears >= 60;
  const isAdult = input.ageYears >= 22 && input.ageYears < 60;
  const isChildNative = input.ageYears < 14;

  // Strict Parashari Dosha detection per life category (Localized multi-script regexes)
  const h7Occupants = input.natalPlanets.filter(p => p.house === 7);
  const h8Occupants = input.natalPlanets.filter(p => p.house === 8);
  const hasMarriageDosha = !!(
    (isManglik && !input.isManglikCancelled) ||
    h7Occupants.some(p => ["Rahu", "Ketu", "Saturn", "Mars"].includes(p.graha)) ||
    h8Occupants.some(p => ["Rahu", "Ketu", "Saturn", "Mars"].includes(p.graha)) ||
    input.natalPlanets.find(p => p.graha === h7.lord)?.debilitated ||
    (!input.isManglikCancelled && input.engineDoshas.some(d => /kuja|manglik|kalatra|vivaha|7th|8th|ಕುಜ|ಮಾಂಗಲಿಕ|ಕಳತ್ರ|ವಿವಾಹ|कुज|मांगलिक|कलत्र|विवाह|కుజ|మాంగళిక|కళత్ర|వివాహ|குஜ|மாங்கல்ய|களத்திர|திருமண/i.test(d.name)))
  );

  const h5Occupants = input.natalPlanets.filter(p => p.house === 5);
  const hasSantanaDosha = !!(
    h5Occupants.some(p => ["Rahu", "Ketu", "Saturn", "Mars"].includes(p.graha)) ||
    input.natalPlanets.find(p => p.graha === h5.lord)?.debilitated ||
    jupiterPlacement?.debilitated ||
    input.engineDoshas.some(d => /santana|putra|naga|sarpa|pitru|5th|ಸಂತಾನ|ಪುತ್ರ|ನಾಗ|ಸರ್ಪ|ಪಿತೃ|संतान|पुत्र|नाग|सर्प|पितृ|సంతాన|పుత్ర|నాగ|సర్ప|పితృ|சந்தான|புத்திர|நாக|சர்ப்ப|பித்ரு/i.test(d.name))
  );

  const hasBalyaDosha = isChildNative && !!(
    (moonPlacement && [6, 8, 12].includes(moonPlacement.house)) ||
    input.natalPlanets.find(p => p.graha === h1.lord)?.debilitated ||
    input.engineDoshas.some(d => /balarishta|balya|gandanta|arogya|pediatric|ಬಾಲಾರಿಷ್ಟ|ಬಾಲ್ಯ|ಗಂಡಾಂತ|ಆರೋಗ್ಯ|बालारिष्ट|बाल्य|गंडांत|आरोग्य|బాలారిష్ట|బాల్య|గండాంత|ఆరోగ్య|பாலாரிஷ்ட|பால்ய|கண்டாந்த|ஆரோக்கிய/i.test(d.name))
  );

  const h10Occupants = input.natalPlanets.filter(p => p.house === 10);
  const hasCareerDosha = !!(
    h10Occupants.some(p => ["Rahu", "Ketu"].includes(p.graha)) ||
    input.natalPlanets.find(p => p.graha === h10.lord)?.debilitated ||
    saturnPlacement?.debilitated ||
    input.engineDoshas.some(d => /karma|shrapit|amavasya|grahan|10th|ಕರ್ಮ|ಶ್ರಾಪಿತ|ಅಮಾವಾಸ್ಯೆ|ಗ್ರಹಣ|कर्म|श्रापित|अमावस्या|ग्रहण|కర్మ|శ్రాపిత|అమావాస్య|గ్రహణ|கர்ம|ஸ்ராபித|அமாவாசை|கிரகண/i.test(d.name))
  );

  const h2Occupants = input.natalPlanets.filter(p => p.house === 2);
  const h11Occupants = input.natalPlanets.filter(p => p.house === 11);
  const hasWealthDosha = !!(
    h2Occupants.some(p => ["Rahu", "Ketu"].includes(p.graha)) ||
    h11Occupants.some(p => ["Rahu", "Ketu"].includes(p.graha)) ||
    input.natalPlanets.find(p => p.graha === h2.lord)?.debilitated ||
    input.engineDoshas.some(d => /dhana|daridra|kemadruma|2nd|11th|ಧನ|ದಾರಿದ್ರ್ಯ|ಕೇಮದ್ರುಮ|धन|दारिद्र्य|केमद्रुम|ధన|దారిద్ర్య|కేమద్రుమ|தன|தாரித்ரிய|கேமத்ரும/i.test(d.name))
  );

  const h6Occupants = input.natalPlanets.filter(p => p.house === 6);
  const hasHealthDosha = !!(
    h6Occupants.some(p => ["Saturn", "Rahu", "Mars"].includes(p.graha)) ||
    input.natalPlanets.find(p => p.graha === h6.lord)?.debilitated ||
    input.natalPlanets.find(p => p.graha === h1.lord)?.debilitated ||
    input.engineDoshas.some(d => /roga|maraka|mrityu|balarishta|health|arogya|ರೋಗ|ಮಾರಕ|ಮೃತ್ಯು|ಬಾಲಾರಿಷ್ಟ|ಆರೋಗ್ಯ|रोग|मारक|मृत्यु|बालारिष्ट|आरोग्य|రోగ|మారక|మృత్యు|బాలారిష్ట|ఆరోగ్య|ரோக|மாரக|மிருத்யு|பாலாரிஷ்ட|ஆரோக்கிய/i.test(d.name))
  );

  const getMarriageDirectives = () => {
    if (maritalSel === "married" && childrenSel === "has_children") {
      return {
        statusDesc: "ALREADY MARRIED WITH CHILDREN",
        p1: "Foundation of marital partnership rooted in 7th house, 7th lord, and running Dasha-Bhukti. Analyze how planetary positions bless the mature, enduring bond of husband and wife managing a home and family. NEVER mention matchmaking, wedding proposals, alliance search, or marriage timing.",
        p2: "Real-life marital dynamics: co-parenting harmony, mutual respect in financial decisions, dividing domestic duties, emotional closeness amidst routine life, resolving occasional miscommunications or stress from work spilling into home, and standing as loving partners in raising children.",
        p3: "Future marital harmony, upcoming Gochara transits of Guru and Shani over the next 1–3 years, deepening companionship, joint family achievements, and enduring domestic tranquility (strictly no remedies).",
        p4Callout: hasMarriageDosha
          ? "Analyze the detected planetary friction affecting domestic peace or spouse's stress, and prescribe specific Vedic remedies (Lakshmi-Narayana or Gauri-Shankara pooja at Sri Kshetra Gokarna Mahabaleshwara) strictly for marital peace—NEVER for 'marriage delay'."
          : "Write 100% about the couple's deep mutual trust, shared values, emotional intimacy, and protective marital sanctuary."
      };
    }
    if (maritalSel === "married" && childrenSel === "no_children") {
      return {
        statusDesc: "MARRIED COUPLE WITHOUT CHILDREN",
        p1: "Foundation of marriage rooted in 7th house, 7th lord, and running Dasha-Bhukti. Deep soul connection and mutual devotion between the two partners. STRICT MANDATE: ZERO MENTION OF CHILDREN, SCHOOLING, PARENTING, OR CHILD-RAISING IN THIS CHAPTER.",
        p2: "Real-life partnership dynamics: standing as a steadfast emotional sanctuary and pillar of strength for each other. Complete mutual trust, shared ambitions, domestic warmth, and navigating external societal or family pressures together as an unbreakable united team.",
        p3: "Future marital trajectory, upcoming Gochara transits of Guru and Shani over the next 1–3 years, strengthening emotional and material security, shared travel, and flourishing mutual companionship (strictly no remedies).",
        p4Callout: hasMarriageDosha
          ? "Analyze the detected planetary friction in 7th/8th house affecting spousal harmony or health, and prescribe specific Vedic remedies at Sri Kshetra Gokarna Mahabaleshwara for mutual peace."
          : "Write 100% about the couple's profound mutual companionship, emotional warmth, deep alignment of hearts, and unconditional spousal devotion."
      };
    }
    if (maritalSel === "unmarried") {
      return {
        statusDesc: "UNMARRIED / SEEKING LIFE PARTNER",
        p1: "Astrological foundation of marriage alliance: 7th house sign, 7th lord placement, Vivahakaraka, and vivaha yoga potential under running Dasha-Bhukti. Timing of auspicious alliance windows.",
        p2: "Real-life emotional and partner-search reality: navigating alliance proposals, overcoming internal confusion, hesitations, or family anxiety over marriage timing, identifying essential character traits of an ideal partner reflecting the 7th lord, and avoiding hasty decisions.",
        p3: "Auspicious marriage timing windows, favorable Gochara transits (Guru Bala and Saturn transit support) over the next 1–3 years, direction of spouse, and smooth alliance finalization (strictly no remedies).",
        p4Callout: hasMarriageDosha
          ? `Analyze the detected ${isManglik ? "Kuja/Manglik Dosha" : "7th/8th house obstacle"} causing hesitation or delay in finding the right partner, and prescribe specific Vedic remedies (${isManglik ? "Subramanya / Mangala Pooja at Sri Kshetra Gokarna Mahabaleshwara" : "Gauri-Shankara Kalyana Pooja at Sri Kshetra Gokarna Mahabaleshwara"}) for early, auspicious marriage settlement.`
          : "Write 100% about the native's auspicious Vivaha Yoga, emotional maturity, ready alignment for a noble life partner, and divine blessings for a joyful marital union."
      };
    }
    // When marital status is "general" (client's marital status is unknown/unspecified):
    // Perform 100% authentic Vedic astrological deduction based on Age, 7th house, running Dasha-Bhukti, Gochara, and Doshas:
    if (isChild || isYouth) {
      return {
        statusDesc: "DEDUCED: YOUTH COHORT — CHARACTER, EMOTIONAL MATURITY & SELF-DISCIPLINE",
        p1: `Classical 7th house (${h7.sign}) and 7th lord ${h7.lordStr} analysis. At age ${Math.floor(input.ageYears)}, this house governs emotional poise, personal boundaries, character formation, and mutual respect with peers and mentors under running ${dashaLine}. STRICT MANDATE: ABSOLUTELY ZERO MENTION OF MARRIAGE, DATING, ROMANCE, WEDDINGS, OR PROPOSALS.`,
        p2: "Developing mutual understanding, choosing noble friendships, respecting teachers and family elders, maintaining emotional discipline, and avoiding premature social distractions.",
        p3: "Character cultivation, interpersonal maturity, and building positive social confidence over the next 1–3 years (strictly no remedies).",
        p4Callout: hasMarriageDosha
          ? "Analyze subtle planetary influences causing restlessness or social distraction, and prescribe morning Gayatri prayer and Ganesha invocation for steadfast willpower and academic focus."
          : "Write 100% about the youth's innate moral clarity, emotional boundaries, noble companions, and radiant character."
      };
    }

    if (input.ageYears >= 60) {
      // Senior / Elder (60+)
      return {
        statusDesc: "DEDUCED: REVERED SENIOR COMPANIONSHIP & DOMESTIC SERENITY",
        p1: `7th house (${h7.sign}) and 7th lord ${h7.lordStr} placed ${h7.lordWhere}. As a respected elder at age ${Math.floor(input.ageYears)}, the 7th house radiates lifelong companionship, spousal longevity (Mangalya Sukha), and peaceful twilight years together under running ${dashaLine}. STRICT MANDATE: NEVER MENTION MATCHMAKING OR MARRIAGE DELAY.`,
        p2: `Lived reality: quiet mutual care, attentive support for each other's physical well-being, shared memories of decades together, and serving as revered marital role models for the younger generation.`,
        p3: `Serene domestic harmony, family gatherings, and spiritual companionship over the next 1–3 years (strictly no remedies).`,
        p4Callout: hasMarriageDosha
          ? "Prescribe sacred Gauri-Shankara and Mahamrityunjaya Pooja at Sri Kshetra Gokarna Mahabaleshwara for spouse's health and longevity."
          : "Write 100% about the beauty of lifelong companionship, peaceful home atmosphere, and divine marital grace."
      };
    }

    // Adult Native (22 to 59 Years) - Marital status unknown / unspecified ("general"):
    // CRITICAL MANDATE: NEVER assume the native is already married or has a wife. NEVER mention dividing household chores with wife.
    // Ground analysis in 7th House Vivaha Yoga, 7th Lord, Vivahakaraka, Kuja/Kalatra Dosha, Spouse Archetype, Direction, and Dasha-Gochara timing:
    if (hasMarriageDosha) {
      return {
        statusDesc: "DEDUCED: ADULT (STATUS UNSPECIFIED) — 7TH HOUSE AFFLICTION / VIVAHA DOSHA PACIFICATION",
        p1: `Astrological foundation of 7th house (${h7.sign}), 7th lord ${h7.lordStr} placed ${h7.lordWhere}, Vivahakaraka (${input.gender === "Female" ? "Guru/Jupiter" : "Shukra/Venus"}), and running ${dashaLine}. At age ${Math.floor(input.ageYears)}, astrological scrutiny reveals that detected ${isManglik ? "Kuja/Manglik Dosha" : "Kalatra Dosha / 7th house affliction"} creates karmic friction. Explain the planetary root cause: for alliance seekers, this causes unexpected delays, mismatched proposals, or hesitation in finalizing marriage; in relationships, it tests communication and emotional patience. DO NOT assume native currently has a wife.`,
        p2: `Lived reality of matrimonial and relational karma: identifying essential partner character traits reflecting 7th lord ${h7.lordStr} with ${spouseDirection} directional alignment. Overcoming emotional weariness from past delays, preserving self-esteem, transparent communication, and maintaining high ethical discernment in choosing a life partner.`,
        p3: `Auspicious timing progression over the next 1–3 years: how upcoming Gochara transits of Jupiter (Guru Bala) and Saturn pacify past hurdles, unlocking favorable timing windows for matrimonial settlement and enduring domestic peace (strictly no remedies).`,
        p4Callout: `Analyze the detected matrimonial/relational obstacle (${isManglik ? "Kuja/Manglik Dosha" : "Kalatra Dosha"}) and prescribe sacred Vedic remedies (${isManglik ? "Subramanya / Mangala Pooja & Kshirabhishekam" : "Gauri-Shankara Kalyana Pooja"}) at Sri Kshetra Gokarna Mahabaleshwara for early, auspicious marriage settlement and domestic peace.`
      };
    }

    return {
      statusDesc: "DEDUCED: ADULT (STATUS UNSPECIFIED) — AUSPICIOUS 7TH HOUSE VIVAHA YOGA & PARTNERSHIP BLESSING",
      p1: `Auspicious 7th house (${h7.sign}), 7th lord ${h7.lordStr} placed ${h7.lordWhere}, Vivahakaraka, and running ${dashaLine}. At age ${Math.floor(input.ageYears)}, the unobstructed 7th house alignment bestows dignified Vivaha Yoga, deep emotional fidelity, and planetary readiness for a lasting, harmonious life partnership. DO NOT assume native currently has a wife or divide household chores.`,
      p2: `Lived reality: noble partner archetype reflecting 7th lord ${h7.lordStr} arriving from ${spouseDirection} direction, transparent communication, emotional poise, and readiness to establish an enduring, dignified bond. Navigating alliance decisions with clarity, family honor, and mutual respect.`,
      p3: `Auspicious timing windows, favorable Gochara transits (${isGuruBala ? "active Guru Bala" : "favorable transits"}) over the next 1–3 years, and joyful progression toward matrimonial fulfillment and household stability (strictly no remedies).`,
      p4Callout: "Write 100% about the native's auspicious Vivaha Yoga, emotional maturity, divine blessing for a noble partner, and lasting matrimonial happiness."
    };
  };

  const getChildrenDirectives = () => {
    if (childrenSel === "has_children") {
      return {
        statusDesc: "ALREADY HAS CHILDREN (LIVING CHILDREN)",
        p1: "5th house (Santana & Buddhi Sthana), 5th lord placement, and Putrakaraka Jupiter governing the intellectual brilliance, moral character, and life trajectory of your living children. STRICT MANDATE: NATIVE ALREADY HAS CHILDREN. DO NOT WRITE ABOUT CONCEPTION DELAYS, PREGNANCY ATTEMPTS, OR INFERTILITY WORRIES.",
        p2: "Real-life parenting dynamics: nurturing your children's scholastic excellence, managing daily parental dilemmas (screen time balance, concentration, exam composure, emotional stubbornness), fostering creative talents, and maintaining warm, respectful parent-child communication.",
        p3: "Children's upcoming scholastic and personal milestones, academic advancement, flourishing unique talents, and family pride over the next 1–3 years (strictly no remedies).",
        p4Callout: hasSantanaDosha
          ? "Analyze subtle planetary afflictions touching the 5th house affecting children's academic focus, health, or emotional restlessness, and prescribe specific protective Vedic remedies (Medha Dakshinamurthy or Santana Gopala Pooja at Sri Kshetra Gokarna Mahabaleshwara) for the children's scholastic success and wellbeing."
          : "Write 100% about the joy of parenthood, your children's natural intelligence, moral virtues, academic potential, and the lasting pride they bring to your family lineage."
      };
    }
    if (childrenSel === "no_children") {
      return {
        statusDesc: "COUPLE WITHOUT CHILDREN / ASPIRING FOR PROGENY",
        p1: "Deep classical 5th house, 5th lord, and Putrakaraka Jupiter analysis. Compassionate, reverent astrological validation of your heartfelt prayers and quiet longing for a child, reassuring you that lineage continuity is encoded in your Poorva Punya. STRICT MANDATE: DO NOT ASSUME THEY CURRENTLY HAVE CHILDREN. DO NOT DISCUSS SCHOOLING, EXAMS, OR PARENTING.",
        p2: "Real-life emotional and family reality: acknowledging the quiet emotional heartache and unspoken vulnerability, managing societal or family questions with mutual spousal grace and dignity, standing united as an unwavering emotional anchor for each other, and keeping hope and divine faith strong.",
        p3: "Astrological timing windows for progeny: analyzing the running Dasha-Bhukti, upcoming Gochara Guru Bala (Jupiter transit from Moon into fertile houses 2, 5, 7, 9, 11), favorable planetary windows over the next 1–3 years, and divine family expansion (strictly no remedies).",
        p4Callout: hasSantanaDosha
          ? "Analyze the detected 5th house planetary affliction (Naga/Sarpa Dosha, Rahu-Ketu axis, or Saturn aspect) causing delay in progeny, and prescribe sacred Vedic remedies: Daily Santana Gopala Mantra, Thursday Gau-seva, and Subrahmanya / Naga Shanti Pooja at Sri Kshetra Gokarna Mahabaleshwara for early, healthy child blessing."
          : "DEDICATED PROGENY BLESSING & HOPE SHIELD: Reassure the couple with deep spiritual warmth regarding their fertile astrological periods under upcoming Guru transit, divine grace, and joyful readiness for lineage fulfillment."
      };
    }
    // When children status is "general" (client's children status is unknown/unspecified):
    // Perform 100% authentic Vedic astrological deduction based on Age, 5th house, Putrakaraka Jupiter, and Santana Doshas:
    if (isChild || isYouth) {
      return {
        statusDesc: "DEDUCED: YOUTH COHORT — PURE BUDDHI, VIDYA & SCHOLASTIC INTELLECT",
        p1: `5th house (${h5.sign}) as Buddhi Sthana, 5th lord ${h5.lordStr} placed ${h5.lordWhere}, and Putrakaraka Jupiter governing intellectual grasping capacity, memory power, and academic focus under running ${dashaLine}. STRICT MANDATE: ZERO MENTION OF PROGENY, CONCEPTION, OR HAVING CHILDREN.`,
        p2: "Scholastic habits, analytical reasoning, exam composure, creative talents, and discipline in studies.",
        p3: "Academic milestones, competitive exam success, and cognitive growth over the next 1–3 years (strictly no remedies).",
        p4Callout: "Write 100% about the student's personal analytical reasoning, memory power, scholarly discipline, and intellectual confidence."
      };
    }

    if (input.ageYears >= 60) {
      // Senior / Elder (60+)
      return {
        statusDesc: "DEDUCED: SENIOR CITIZEN — GRANDCHILDREN JOY & LINEAGE LEGACY",
        p1: `5th house (${h5.sign}), 5th lord ${h5.lordStr} placed ${h5.lordWhere}, and Putrakaraka Jupiter. As an elder at age ${Math.floor(input.ageYears)}, the 5th house represents the crown of Purva Punya: joy of grandchildren (Poutra-Poutri Sukha), family continuity, and lineage fulfillment under running ${dashaLine}.`,
        p2: "Lived reality: warm intergenerational bonding, affectionate moments with grandchildren, transmitting cultural wisdom, and peaceful family gatherings.",
        p3: "Enduring family continuity, pride in flourishing descendants, and generational harmony over the next 1–3 years (strictly no remedies).",
        p4Callout: hasSantanaDosha
          ? "Prescribe lineage-protection sankalpa at Sri Kshetra Gokarna Mahabaleshwara for all-round progeny and grandchildren welfare."
          : "Write 100% about grandchildren joy, noble family heritage, and enduring ancestral blessings."
      };
    }

    // Adult Native (22 to 59 Years) - Children status unknown / unspecified ("general"):
    // CRITICAL MANDATE: NEVER assume the native currently has school-going children. DO NOT discuss children's school exams, homework, or screen time.
    // Evaluate 5th house as Buddhi Sthana, Poorva Punya, and Santana Yoga (Progeny Horizons):
    if (hasSantanaDosha) {
      return {
        statusDesc: "DEDUCED: ADULT (STATUS UNSPECIFIED) — 5TH HOUSE / SANTANA DOSHA PACIFICATION",
        p1: `Classical 5th house (${h5.sign}), 5th lord ${h5.lordStr} placed ${h5.lordWhere}, Putrakaraka Jupiter, and running ${dashaLine}. At age ${Math.floor(input.ageYears)}, 5th house governs intellectual clarity, Poorva Punya (past-life merit), and the sacred potential for lineage expansion (Santana Yoga). Astrological scrutiny reveals that detected Santana or Naga Dosha creates karmic impediments or delays in welcoming children. DO NOT discuss school homework or parenting children.`,
        p2: "Lived reality: managing emotional vulnerability and patient prayer, maintaining physical and mental wellness, shielding oneself from outside societal queries, and cultivating intellectual resilience and creative endeavors.",
        p3: "Astrological timing windows: analyzing upcoming Gochara transits of Jupiter (Guru Bala transiting fertile houses 2, 5, 7, 9, 11 from Moon) over the next 1–3 years to dissolve hurdles and activate progeny blessings (strictly no remedies).",
        p4Callout: "Analyze the detected 5th house affliction (Santana/Naga Dosha) and prescribe sacred Vedic remedies: Daily Santana Gopala Mantra, Thursday Gau-seva, and Subrahmanya / Naga Shanti Pooja at Sri Kshetra Gokarna Mahabaleshwara for healthy child blessing and lineage continuity."
      };
    }

    return {
      statusDesc: "DEDUCED: ADULT (STATUS UNSPECIFIED) — AUSPICIOUS 5TH HOUSE POORVA PUNYA & PROGENY BLESSING",
      p1: `5th house (${h5.sign}), 5th lord ${h5.lordStr} placed ${h5.lordWhere}, and Putrakaraka Jupiter. At age ${Math.floor(input.ageYears)}, unobstructed 5th house configurations indicate auspicious Poorva Punya, sharp creative intellect, and divine blessings for family expansion and lineage continuity under running ${dashaLine}. DO NOT discuss school homework or existing children.`,
      p2: "Lived reality: decision-making wisdom, artistic or professional creativity, ethical values, readiness for family milestones, and emotional serenity.",
      p3: "Auspicious fertility windows, upcoming Guru Gochara support over the next 1–3 years, and joyful lineage expansion (strictly no remedies).",
      p4Callout: "Write 100% about the native's auspicious Santana Yoga, intellectual virtues, divine lineage protection, and joyful family expansion."
    };
  };

  const dMar = getMarriageDirectives();
  const dChd = getChildrenDirectives();

  const bhavishya = isChild ? `${header(
    input,
    "bhavishya",
    "You are a wise and compassionate Vedic astrologer specializing in child horoscopes, analyzing early intellectual development, education, activities, creative talents, health, and parental nurturing."
  )}
CRITICAL CHILD HOROSCOPE ACCURACY REQUIREMENT:
The native is a child (${Math.floor(input.ageYears)} years old). DO NOT generate any adult marriage, romantic, or progeny predictions.
Instead, write deep astrological guidance for the child's development across these key areas.
For each category, write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\\n\\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS.
- Paragraph 1 (5–6 full lines): Deep astrological & planetary foundation and early cognitive/physical traits.
- Paragraph 2 (5–6 full lines): Nurturing environment, behavioral development, and daily routine.
- Paragraph 3 (5–6 full lines): Future development, learning milestones, and talent blossoming over the next 1–3 years (WITHOUT remedies).
- Paragraph 4 (5–6 full lines, starting with 【...】): Dedicated Guidance or Shield callout card.

1. Education & Early Intellect (Vidya & Buddhi):
   - 4th House (Vidya): ${getHouseInfo(4).sign} (Lord ${getHouseInfo(4).lordStr} ${getHouseInfo(4).lordWhere}). 5th House (Buddhi): ${h5.sign} (Lord ${h5.lordStr} ${h5.lordWhere}).
   - Mercury (Budha): placed ${formatPlacementText(input.natalPlanets.find(p => p.graha === "Mercury"))}. Jupiter (Guru): placed ${formatPlacementText(jupiterPlacement)}.
   - Paragraph 1 (5–6 lines, NO REMEDIES): Memory power, grasping capacity, academic inclination, and intellectual focus.
   - Paragraph 2 (5–6 lines, NO REMEDIES): Optimal learning environment, curiosity development, and parental guidance.
   - Paragraph 3 (5–6 lines, NO REMEDIES): Upcoming scholastic milestones, cognitive advancement, and study rhythm over the next 1–3 years.
   - Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED INTELLECTUAL GUIDANCE starting with 【...】: STRICT MANDATE: NO DOSHA DETECTED—DO NOT PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about the child's natural learning curiosity, reading habits, supportive study sanctuary, and academic potential.

2. Talents, Activities & Sports (Kala, Kreeda & Kaushalya):
   - 3rd House (Parakrama): ${getHouseInfo(3).sign}. 5th House: ${h5.sign}. Mars: placed ${formatPlacementText(marsPlacement)}. Venus: placed ${formatPlacementText(venusPlacement)}.
   - Paragraph 1 (5–6 lines, NO REMEDIES): Physical energy, sports inclination, and active stamina.
   - Paragraph 2 (5–6 lines, NO REMEDIES): Extracurricular inclinations, artistic expression, music, and creative hobbies.
   - Paragraph 3 (5–6 lines, NO REMEDIES): Future creative expansion, athletic skill development, and group participation over the next 1–3 years.
   - Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED TALENTS GUIDANCE starting with 【...】: STRICT MANDATE: NO DOSHA DETECTED—DO NOT PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about the child's artistic inclinations, sportsmanship, peer camaraderie, and creative expression.

3. Future Foundation & Character:
   - Paragraph 1 (5–6 lines, NO REMEDIES): Moral compass, integrity, leadership qualities, and truthfulness.
   - Paragraph 2 (5–6 lines, NO REMEDIES): Disciplined habit formation, respectful demeanor towards elders, and emotional resilience.
   - Paragraph 3 (5–6 lines, NO REMEDIES): Maturing sense of responsibility, noble character traits, and lasting values over the next 1–3 years.
   - Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED CHARACTER GUIDANCE starting with 【...】: STRICT MANDATE: NO DOSHA DETECTED—DO NOT PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about instilling timeless ethical values, truthful habits, patience, and noble life orientation.

4. Family Environment & Upbringing:
   - Paragraph 1 (5–6 lines, NO REMEDIES): Family warmth, emotional security, and protective home atmosphere.
   - Paragraph 2 (5–6 lines, NO REMEDIES): Parental nurturing style, communication, and mutual affection.
   - Paragraph 3 (5–6 lines, NO REMEDIES): Deepening emotional connection with parents, sibling harmony, and joyous domestic memories over the next 1–3 years.
   - Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOMESTIC GUIDANCE starting with 【...】: STRICT MANDATE: NO DOSHA DETECTED—DO NOT PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about preserving peaceful family rhythms, mutual affection, gentle parental guidance, and joyful family warmth.

5. Health, Vitality & Pediatric Care (Bala Arogya):
   - 1st House (Lagna): ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}). 6th House: ${h6.sign}.
   - Paragraph 1 (5–6 lines, NO REMEDIES): Pediatric vitality, natural immunity, seasonal care, and physical constitution.
   - Paragraph 2 (5–6 lines, NO REMEDIES): Daily nutritious routine, active vitality, sleep rhythms, and physical wellness.
   - Paragraph 3 (5–6 lines, NO REMEDIES): Future growth stamina, metabolic balance, and energetic childhood wellness over the next 1–3 years.
   ${hasBalyaDosha
     ? `- Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ಬಾಲ್ಯ ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಆಯುಷ್ಯ ರಕ್ಷಾ ಶಾಂತಿ】 / 【Balya Dosha Analysis & Pediatric Health Shanti】): Analyze subtle Moon/Lagna planetary affliction, and give specific Vedic remedies at Sri Kshetra Gokarna Mahabaleshwara.`
     : `- Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED VITALITY GUIDANCE starting with 【...】: STRICT MANDATE: NO DOSHA DETECTED—DO NOT PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about the child's natural physical constitution, metabolic stamina, healthy growth rhythms, and robust vitality.`
   }

${JSON_RULE}
{"bhavishya":{"marriage":"three paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】 if dosha present","children":"three paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】 if dosha present","career":"three paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】 if dosha present","wealth":"three paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】 if dosha present","health":"three paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】 if dosha present"}}`
  : `${header(
    input,
    "bhavishya",
    "You are an authoritative Vedic astrologer analyzing specific life areas based strictly on 7th house lord, 5th house lord, 10th house lord, and 2nd house lord."
  )}
CRITICAL 100% PERSONALIZED SHASTRIYA ACCURACY REQUIREMENT:
Provide a 100% personalized astrological reading for the following 5 life categories based on this chart's exact computed placements (ZERO generic statements):
- Native Age: ${Math.floor(input.ageYears)} years old, Gender: ${(input.gender || "Male").toUpperCase()}.
${input.ageYears >= 60 ? "- SENIOR CITIZEN (60+ YEARS): The native is a senior. Tailor all interpretations with deep emotional reverence for their life stage. Focus on lifelong spiritual companionship, domestic serenity, mutual health care, family legacy, joy from grandchildren, mentorship, and asset preservation. NEVER suggest wedding proposals, matchmaking, or seeking marriage alliances." : input.ageYears < 22 ? "- YOUTH / STUDENT (< 22 YEARS): The native is in their student/youth phase. Focus on higher education, college admissions, competitive exams, study discipline, character formation, avoiding premature distractions, and building professional foundations. NEVER suggest marriage timing or finding romantic partners." : "- ADULT (22-59 YEARS): Deliver deeply resonant, mature astrological readings strictly grounded in chart facts, career ascent, and family prosperity."}
For EACH category, write THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters). When a dosha or planetary affliction is present, append a dedicated 4th Section starting with 【...】 (5-6 full lines):
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS. Speak directly to 'you'.
- Paragraph 1: Planetary & House Astrological Foundation (5-6 full lines, no remedies).
- Paragraph 2 (CRITICAL REAL-LIFE TENSION, FRICTION & CONFUSION MANDATE): 5-6 full lines diagnosing CURRENT REAL-LIFE TENSION, STRESS POINTS, CONFUSION (ಗೊಂದಲ/द्वंद्व), AND DILEMMAS. Explicitly call out what is actually troubling the native:
  * In Marriage: Fights, misunderstandings, ego clashes, emotional distance, family interference, spouse's work stress spilling into home, or frustration over partner search/marriage delay.
  * In Children: For parents: child's screen time, stubbornness, lack of study focus, exam anxiety; For couples without children: silent heartache, societal questions, anxiety over delays.
  * In Career: Lack of recognition for hard work, workplace politics, delayed promotion/salary appraisals, dilemma between switching jobs and staying, exhaustion from heavy workload.
  * In Wealth: Money coming in but immediately drained by sudden unexpected expenses, blocked payments, EMI/debt stress, asset disputes, cash flow bottlenecks.
  * In Health: Mental exhaustion, insomnia/disturbed sleep, digestive sensitivities (Pitta/acidity/bloating), musculoskeletal stiffness in Lagna/6th house anatomical zones (${lagnaAnatomy}, ${rogaAnatomy}), feeling drained.
- Paragraph 3: Future unfolding, milestones, and trajectory over next 1-3 years under upcoming transits WITHOUT remedies (5-6 full lines, no remedies).
- Paragraph 4: Dedicated Callout Section starting with 【...】 (5-6 full lines).

1. Marriage & Relationships (User Selected Status: ${maritalSel.toUpperCase()}):
   - Native Status: ${dMar.statusDesc}.
   - 7th House Sign: ${h7.sign}. 7th House Lord: ${h7.lordStr} is placed ${h7.lordWhere}.
   - Occupants of 7th House: ${h7.occStr}.
   - Native Gender: ${(input.gender || "Male").toUpperCase()}.
   - Karaka Placement: ${(input.gender || "Male") === "Female" ? `Jupiter (Jeevakaraka) is placed ${formatPlacementText(jupiterPlacement)}, 8th House (Mangalya Sthana) is ${h8.sign} with lord ${h8.lordStr}` : `Venus (Shukrakaraka) is placed ${formatPlacementText(venusPlacement)}`}.
   - Kuja / Manglik Status: ${input.isManglikCancelled ? `Kuja Dosha CANCELLED / NEUTRALIZED via Parashari Apavada (${input.manglikCancellationReason}). Do not prescribe remedies for delay.` : isManglik ? `Kuja Dosha indicated, Mars placed ${formatPlacementText(marsPlacement)}` : "No Kuja Dosha (Mars is comfortably placed outside 1/2/4/7/8/12)"}.
   - Direction of Spouse Alignment: ${spouseDirection} direction from birthplace.
   - Vivaha Yoga & Transits: Running ${dashaLine}. Jupiter transit: ${guruTransit ? `${guruTransit.houseFromMoon} from Chandra (${isGuruBala ? "Guru Bala active" : "Guru testing"})` : "active"}. Saturn transit: ${shaniTransit ? `${shaniTransit.houseFromMoon} from Chandra` : "active"}.
   - STRICT FORMATTING MANDATE: ABSOLUTELY ZERO PARENTHESES OR BRACKETS like '(7th house)', '7ನೇ ಮನೆ', '(ತುಲಾ)', or 'Bhava 7' in your output text!
   - Paragraph 1 (5–6 lines, NO REMEDIES): ${dMar.p1}
   - Paragraph 2 (5–6 lines, NO REMEDIES): ${dMar.p2}
   - Paragraph 3 (5–6 lines, NO REMEDIES): ${dMar.p3}
   - Paragraph 4 (5–6 lines, starting with 【...】): ${dMar.p4Callout}

2. Children & Progeny (User Selected Status: ${childrenSel.toUpperCase()}):
   - Native Status: ${dChd.statusDesc}.
   - 5th House Sign: ${h5.sign}. 5th House Lord: ${h5.lordStr} is placed ${h5.lordWhere}.
   - Occupants of 5th House: ${h5.occStr}.
   - Putrakaraka Jupiter (Guru): placed ${formatPlacementText(jupiterPlacement)}.
   - Progeny Transit: Jupiter transit ${guruTransit?.houseFromMoon} from Chandra (${isGuruBala ? "Guru Bala active" : "testing phase"}). Running ${dashaLine}.
   - STRICT FORMATTING MANDATE: ABSOLUTELY ZERO PARENTHESES OR BRACKETS like '(5th house)', '5ನೇ ಮನೆ', '(ಸಿಂಹ)', or 'Bhava 5' in your output text!
   - Paragraph 1 (5–6 lines, NO REMEDIES): ${dChd.p1}
   - Paragraph 2 (5–6 lines, NO REMEDIES): ${dChd.p2}
   - Paragraph 3 (5–6 lines, NO REMEDIES): ${dChd.p3}
   - Paragraph 4 (5–6 lines, starting with 【...】): ${dChd.p4Callout}

3. Career & Profession:
   - 10th House Sign: ${h10.sign}. 10th House Lord: ${h10.lordStr} is placed ${h10.lordWhere}.
   - Occupants of 10th House: ${h10.occStr}.
   - Karmakaraka Saturn (Shani): placed ${formatPlacementText(saturnPlacement)}.
   ${hasCareerDosha
     ? `CRITICAL DOSHA DETECTED: Write EXACTLY FOUR detailed sections separated by double newlines (\\n\\n):
        Paragraph 1 (5–6 lines, NO REMEDIES): Professional aptitude, career stability, leadership prospects, and timing under running ${dashaLine}.
        Paragraph 2 (5–6 lines, NO REMEDIES): Real-life workplace dynamics—addressing lack of recognition for hard work, office politics, delayed promotions, work-life dilemmas (ಗೊಂದಲ/द्वंद्व), and executive skill growth.
        Paragraph 3 (5–6 lines, NO REMEDIES): Future vocational trajectory, upcoming promotions, transitions, business expansion, and milestone timing over the next 1–3 years (strictly no remedies).
        Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಕರ್ಮ ಶಾಂತಿ】 / 【Dosha Analysis & Career Remedy】): Analyze the detected 10th house / Karma / Saturn affliction, explain obstacle mechanisms, and detail Shani Shanti pooja, Dasharatha Stotram, and Rudrabhishekam at Sri Kshetra Gokarna Mahabaleshwara.`
     : `NO DOSHA PRESENT: Write EXACTLY FOUR detailed sections separated by double newlines (\\n\\n):
        Paragraph 1 (5–6 lines, NO REMEDIES): Professional aptitude, career stability, leadership prospects, and timing under running ${dashaLine}.
        Paragraph 2 (5–6 lines, NO REMEDIES): Strategic workplace navigation, executive decision-making, handling demanding workloads, promotions, skill growth, and vocational ascent.
        Paragraph 3 (5–6 lines, NO REMEDIES): Future vocational trajectory, upcoming promotions, transitions, business expansion, and milestone timing over the next 1–3 years (strictly no remedies).
        Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED CAREER ASCENT & EXECUTIVE SHIELD starting with 【...】 (e.g. 【ವೃತ್ತಿ ಪ್ರಗತಿ & ನಾಯಕತ್ವ ರಕ್ಷಾ ಕವಚ】 / 【Career Ascent & Leadership Shield】): Write 100% about the native's personal professional reality, executive decision-making style, specific industry strengths, leadership acumen, professional respect earned, and vocational ascent.`
   }

4. Wealth & Family Finance:
   - 2nd House (Accumulated Wealth): ${h2.sign} (Lord ${h2.lordStr} ${h2.lordWhere}, occupants: ${h2.occStr}).
   - 11th House (Income & Gains): ${h11.sign} (Lord ${h11.lordStr} ${h11.lordWhere}, occupants: ${h11.occStr}).
   - Dhanakaraka Jupiter: placed ${formatPlacementText(jupiterPlacement)}.
   ${hasWealthDosha
     ? `CRITICAL DOSHA DETECTED: Write EXACTLY FOUR detailed sections separated by double newlines (\\n\\n):
        Paragraph 1 (5–6 lines, NO REMEDIES): Financial accumulation, income stability, investments, property gains, and family prosperity.
        Paragraph 2 (5–6 lines, NO REMEDIES): Real-life financial friction—unplanned emergency expenses draining savings, EMI pressure, delayed client payments, cash-flow bottlenecks, and asset management.
        Paragraph 3 (5–6 lines, NO REMEDIES): Future financial trajectory, upcoming gainful periods, debt clearance, and material stability over the next 1–3 years (strictly no remedies).
        Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಧನ ಸಮೃದ್ಧಿ ಶಾಂತಿ】 / 【Dosha Analysis & Financial Shanti】): Analyze the detected financial affliction, obstacle resolution, and prescribe Lakshmi Kubera Aradhana and remedy at Sri Kshetra Gokarna.`
     : `NO DOSHA PRESENT: Write EXACTLY FOUR detailed sections separated by double newlines (\\n\\n):
        Paragraph 1 (5–6 lines, NO REMEDIES): Financial accumulation, income stability, investments, property gains, and family prosperity.
        Paragraph 2 (5–6 lines, NO REMEDIES): Debt management, liquidity planning, wealth preservation, prudent budgeting, and ancestral asset growth.
        Paragraph 3 (5–6 lines, NO REMEDIES): Future financial trajectory, upcoming gainful periods, debt clearance, and material stability over the next 1–3 years (strictly no remedies).
        Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED WEALTH ACCUMULATION & ASSET SHIELD starting with 【...】 (e.g. 【ಧನ ಸಮೃದ್ಧಿ & ಆರ್ಥಿಕ ರಕ್ಷಾ ಕವಚ】 / 【Wealth Prosperity & Investment Shield】): Write 100% about the native's personal wealth accumulation habits, asset preservation, family financial security, investment prudence, and material peace of mind.`
   }

5. Health & Vitality:
   - 1st House (Lagna / Physical Constitution): ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}).
   - 6th House (Roga Sthana): ${h6.sign} (Lord ${h6.lordStr} ${h6.lordWhere}).
   - Sun (Vitality) and Moon (Mental Equanimity) dignity in chart.
   ${hasHealthDosha
     ? `CRITICAL DOSHA DETECTED: Write EXACTLY FOUR detailed sections separated by double newlines (\\n\\n):
        Paragraph 1 (5–6 lines, NO REMEDIES): Physical constitution, vital energy, seasonal wellness precautions, and metabolic stamina. Explicitly touch upon bodily sensations and areas (${lagnaAnatomy}, ${rogaAnatomy}).
        Paragraph 2 (5–6 lines, NO REMEDIES): Real-life somatic stressors—restless sleep/insomnia, digestive sensitivities (Pitta/acidity/bloating), musculoskeletal fatigue in ${lagnaAnatomy}/${rogaAnatomy}, work-life mental exhaustion, and Ayurvedic daily routines.
        Paragraph 3 (5–6 lines, NO REMEDIES): Future physical stamina, seasonal wellness precautions, bodily rejuvenation, and long-term vitality rhythms (strictly no remedies).
        Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಆರೋಗ್ಯ ರಕ್ಷಾ ಶಾಂತಿ】 / 【Dosha Analysis & Health Shield Shanti】): Analyze the detected 6th/8th house roga affliction, and prescribe Mahamrityunjaya japa, Dhanvantari prayer, and Gokarna Mrityunjaya homa.`
     : `NO DOSHA PRESENT: Write EXACTLY FOUR detailed sections separated by double newlines (\\n\\n):
        Paragraph 1 (5–6 lines, NO REMEDIES): Physical constitution, vital energy, seasonal wellness precautions, and metabolic stamina. Explicitly touch upon bodily sensations and areas (${lagnaAnatomy}, ${rogaAnatomy}).
        Paragraph 2 (5–6 lines, NO REMEDIES): Emotional resilience, mental peace, stress mitigation, circadian sleep hygiene, and Ayurvedic daily routines.
        Paragraph 3 (5–6 lines, NO REMEDIES): Future physical stamina, seasonal wellness precautions, bodily rejuvenation, and long-term vitality rhythms (strictly no remedies).
        Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED VITALITY & HEALTH SHIELD starting with 【...】 (e.g. 【ಆರೋಗ್ಯ ಸಂರಕ್ಷಣೆ & ದೈಹಿಕ ರಕ್ಷಾ ಕವಚ】 / 【Vitality Preservation & Wellness Shield】): Write 100% about the native's personal physical constitution, bodily vulnerabilities/sensations (${lagnaAnatomy}, ${rogaAnatomy}), metabolic stamina, and balanced lifestyle rhythms.`
   }

${JSON_RULE}
{"bhavishya":{"marriage":"three paragraphs", "children":"three paragraphs", "career":"three paragraphs", "wealth":"three paragraphs", "health":"three paragraphs"}}`;

  const bhavishyaMarriageChildren = `${header(
    input,
    "bhavishyaMarriageChildren",
    "You are a revered Vedic master astrologer providing an in-depth, authentic reading on Marriage/Partnership and Children/Progeny for " + input.name + "."
  )}
CRITICAL MANDATE:
Write exhaustive, deeply personalized analysis strictly based on ${input.name}'s Janma Kundali.
For each category, write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\n\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS. Write 100% authentic astrological analysis of their life, personality, lived reality, and trajectory!
- Paragraph 1 (5–6 full lines): Deep astrological & planetary foundation (house sign, lord, house placement, aspects, karaka, and running Dasha/Bhukti timing) and its fundamental meaning.
- Paragraph 2 (5–6 full lines): Deep psychological, relational/practical dynamics, daily realities, challenges, and lived experience based on their specific condition.
- Paragraph 3 (5–6 full lines): Future unfolding, upcoming milestones, transit progression, and long-term trajectory over the next 1–3 years (WITHOUT remedies).
- Paragraph 4 (Dedicated Callout Section starting with 【...】):
  If Dosha is detected, begin with 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಶಾಂತಿ】 / 【Dosha Analysis & Vedic Shanti】 in 5-6 full lines analyzing the affliction and prescribing authentic Sri Kshetra Gokarna Mahabaleshwara remedies.
  If No Dosha is detected, begin with 【ದೈವಿಕ ಅನುಗ್ರಹ & ರಕ್ಷಾ ಕವಚ】 / 【Divine Auspicious Shield & Grace】 in 5-6 full lines describing the protective planetary alignment and divine blessing.

1. Marriage & Partnerships (User Selected Status: ${maritalSel.toUpperCase()}):
   - Native Status: ${dMar.statusDesc}.
   - 7th House Sign: ${h7.sign}. 7th House Lord: ${h7.lordStr} is placed ${h7.lordWhere}.
   - Occupants of 7th House: ${h7.occStr}.
   - Vivahakaraka: ${input.gender === "Female" ? `Guru (Jupiter) placed ${formatPlacementText(jupiterPlacement)}` : `Shukra (Venus) placed ${formatPlacementText(venusPlacement)}`}.
   - Kuja/Manglik: ${input.isManglikCancelled ? `Kuja Dosha CANCELLED / NEUTRALIZED via Parashari Apavada (${input.manglikCancellationReason}). Do not prescribe remedies for delay.` : isManglik ? `Yes, Mars placed ${formatPlacementText(marsPlacement)} causing Kuja Dosha` : "No Kuja Dosha"}.
   - Direction of Partner: ${spouseDirection}.
   - Running ${dashaLine}.
   - STRICT FORMATTING MANDATE: ABSOLUTELY ZERO PARENTHESES OR BRACKETS like '(7th house)', '7ನೇ ಮನೆ', '(ತುಲಾ)', or 'Bhava 7' in your output text!
   - Paragraph 1 (5–6 full lines, NO REMEDIES): ${dMar.p1}
   - Paragraph 2 (5–6 full lines, NO REMEDIES): ${dMar.p2}
   - Paragraph 3 (5–6 full lines, NO REMEDIES): ${dMar.p3}
   - Paragraph 4 (5–6 full lines, starting with 【...】): ${dMar.p4Callout}

2. Children & Progeny (User Selected Status: ${childrenSel.toUpperCase()}):
   - Native Status: ${dChd.statusDesc}.
   - 5th House Sign: ${h5.sign}. 5th House Lord: ${h5.lordStr} is placed ${h5.lordWhere}.
   - Occupants of 5th House: ${h5.occStr}.
   - Putrakaraka Jupiter (Guru): placed ${formatPlacementText(jupiterPlacement)}.
   - Progeny Transit: Jupiter transit ${guruTransit?.houseFromMoon} from Chandra (${isGuruBala ? "Guru Bala active" : "testing phase"}). Running ${dashaLine}.
   - STRICT FORMATTING MANDATE: ABSOLUTELY ZERO PARENTHESES OR BRACKETS like '(5th house)', '5ನೇ ಮನೆ', '(ಸಿಂಹ)', or 'Bhava 5' in your output text!
   - Paragraph 1 (5–6 full lines, NO REMEDIES): ${dChd.p1}
   - Paragraph 2 (5–6 full lines, NO REMEDIES): ${dChd.p2}
   - Paragraph 3 (5–6 full lines, NO REMEDIES): ${dChd.p3}
   - Paragraph 4 (5–6 full lines, starting with 【...】): ${dChd.p4Callout}

${JSON_RULE}
{"bhavishya":{"marriage":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】","children":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}}`;

  const bhavishyaCareerWealthHealth = `${header(
    input,
    "bhavishyaCareerWealthHealth",
    "You are a revered Vedic master astrologer providing an in-depth, authentic reading on Career, Wealth, and Health for " + input.name + "."
  )}
CRITICAL MANDATE:
Write exhaustive, deeply personalized analysis strictly based on ${input.name}'s Janma Kundali.
For each category, write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\n\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS.
- Paragraph 1: Planetary & House Astrological Foundation (5-6 full lines).
- Paragraph 2: Psychological, relational/practical dynamics, and lived reality (5-6 full lines).
- Paragraph 3: Future unfolding, milestones, and long-term trajectory over the next 1-3 years under upcoming transits WITHOUT remedies (5-6 full lines).
- Paragraph 4: Dedicated Callout Section starting with 【...】 (5-6 full lines).

1. Career & Profession:
   - 10th House Sign: ${h10.sign}. 10th House Lord: ${h10.lordStr} is placed ${h10.lordWhere}.
   - Occupants of 10th House: ${h10.occStr}.
   - Karmakaraka Saturn (Shani): placed ${formatPlacementText(saturnPlacement)}.
   - Paragraph 1 (5–6 lines, NO REMEDIES): Professional stability, leadership prospects, vocational aptitude, and timing under running ${dashaLine}.
   - Paragraph 2 (5–6 lines, NO REMEDIES): Strategic workplace navigation, career growth, executive strengths, workplace relationships, and public reputation.
   - Paragraph 3 (5–6 lines, NO REMEDIES): Future vocational trajectory, upcoming promotions, transitions, business expansion, and milestone timing over the next 1–3 years (strictly no remedies).
   ${hasCareerDosha
     ? `- Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಕರ್ಮ ಶಾಂತಿ】 / 【Dosha Analysis & Career Remedy】): Analyze the detected 10th house / Karma dosha, explain obstacle mechanisms, and detail Shani Shanti pooja, Dasharatha Stotram, and Rudrabhishekam at Sri Kshetra Gokarna Mahabaleshwara.`
     : `- Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED CAREER ASCENT & EXECUTIVE SHIELD starting with 【...】 (e.g. 【ವೃತ್ತಿ ಪ್ರಗತಿ & ನಾಯಕತ್ವ ರಕ್ಷಾ ಕವಚ】 / 【Career Ascent & Leadership Shield】): Write 100% about the native's personal professional reality, executive decision-making style, specific industry strengths, leadership acumen, professional respect earned, and vocational ascent.`
   }

2. Wealth & Family Finance:
   - 2nd House (Accumulated Wealth): ${h2.sign} (Lord ${h2.lordStr} ${h2.lordWhere}, occupants: ${h2.occStr}).
   - 11th House (Income & Gains): ${h11.sign} (Lord ${h11.lordStr} ${h11.lordWhere}, occupants: ${h11.occStr}).
   - Dhanakaraka Jupiter: placed ${formatPlacementText(jupiterPlacement)}.
   - Paragraph 1 (5–6 lines, NO REMEDIES): Financial accumulation, investments, property gains, and income growth under running ${dashaLine}.
   - Paragraph 2 (5–6 lines, NO REMEDIES): Liquidity planning, family prosperity, asset consolidation, and wealth preservation.
   - Paragraph 3 (5–6 lines, NO REMEDIES): Future financial trajectory, upcoming gainful periods, debt clearance, and material stability over the next 1–3 years (strictly no remedies).
   ${hasWealthDosha
     ? `- Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಧನ ಸಮೃದ್ಧಿ ಶಾಂತಿ】 / 【Dosha Analysis & Financial Shanti】): Analyze the detected financial affliction, obstacle resolution, and prescribe Lakshmi Kubera Aradhana and remedy at Sri Kshetra Gokarna.`
     : `- Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED WEALTH ACCUMULATION & ASSET SHIELD starting with 【...】 (e.g. 【ಧನ ಸಮೃದ್ಧಿ & ಆರ್ಥಿಕ ರಕ್ಷಾ ಕವಚ】 / 【Wealth Prosperity & Investment Shield】): Write 100% about the native's personal wealth accumulation habits, asset preservation, family financial security, investment prudence, and material peace of mind.`
   }

3. Health & Vitality:
   - 1st House (Lagna / Physical Constitution): ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}).
   - 6th House (Roga Sthana): ${h6.sign} (Lord ${h6.lordStr} ${h6.lordWhere}).
   - Sun (Vitality) and Moon (Mental Equanimity) dignity in chart.
   - Paragraph 1 (5–6 lines, NO REMEDIES): Physical constitution, vitality, seasonal wellness precautions, and metabolic stamina. Explicitly touch upon bodily sensations and areas (${lagnaAnatomy}, ${rogaAnatomy}).
   - Paragraph 2 (5–6 lines, NO REMEDIES): Mental equanimity, stress management, sleep quality, nervous resilience, and daily Ayurvedic lifestyle.
   - Paragraph 3 (5–6 lines, NO REMEDIES): Future physical stamina, seasonal wellness precautions, bodily rejuvenation, and long-term vitality rhythms (strictly no remedies).
   ${hasHealthDosha
     ? `- Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಆರೋಗ್ಯ ರಕ್ಷಾ ಶಾಂತಿ】 / 【Dosha Analysis & Health Shield Shanti】): Analyze the detected 6th/8th house roga affliction, and prescribe Mahamrityunjaya japa, Dhanvantari prayer, and Gokarna Mrityunjaya homa.`
     : `- Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED VITALITY & HEALTH SHIELD starting with 【...】 (e.g. 【ಆರೋಗ್ಯ ಸಂರಕ್ಷಣೆ & ದೈಹಿಕ ರಕ್ಷಾ ಕವಚ】 / 【Vitality Preservation & Wellness Shield】): Write 100% about the native's personal physical constitution, metabolic stamina, daily vitality rhythms, lifestyle balance, and bodily resilience.`
   }

${JSON_RULE}
{"bhavishya":{"career":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】","wealth":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】","health":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}}`;

  // Individual Granular Life Domain Prompts (100% Isolated Gemini Calls)
  // Age categories: isChild (< 12), isSenior (>= 60), isYouth (12 <= age < 22), isAdult (22 <= age < 60)

  const bhavishyaMarriage = isChild ? `${header(
    input,
    "bhavishyaChildEducation",
    isInfant 
      ? "You are a revered Vedic master astrologer analyzing Early Cognitive Awakening, Sensory Grasping, and Nursery Environment for infant " + input.name + "."
      : "You are a revered Vedic master astrologer analyzing Education, Intellect, Memory Power, and Academic Aptitude for child " + input.name + "."
  )}
CRITICAL CHILD HOROSCOPE MANDATE:
The native is a ${isInfant ? "tender infant/toddler" : "young child"} (${Math.floor(input.ageYears)} years old). ${isInfant ? "Focus on early auditory recognition, cognitive grasping of surroundings, maternal bond, and soothing nursery rhythms." : "Focus strictly on early education, memory power, cognitive grasping capacity, and parental guidance."} DO NOT mention marriage, romance, or dating.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\n\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS.
- STRICT FORMATTING MANDATE: ABSOLUTELY ZERO PARENTHESES OR BRACKETS like '(4th house)', '4ನೇ ಮನೆ', '(ತುಲಾ)', or 'Bhava 4' in your output text!
4th House (Vidya): ${getHouseInfo(4).sign} (Lord ${getHouseInfo(4).lordStr} ${getHouseInfo(4).lordWhere}). 5th House (Buddhi): ${h5.sign} (Lord ${h5.lordStr} ${h5.lordWhere}).
Mercury (Budha): placed ${formatPlacementText(input.natalPlanets.find(p => p.graha === "Mercury"))}. Jupiter (Guru): placed ${formatPlacementText(jupiterPlacement)}.
Paragraph 1 (5–6 lines, NO REMEDIES): ${isInfant ? "Early auditory alertness, sensory curiosity, instinctive recognition of parents' voices, and responsive babbling." : "Memory power, cognitive retention, learning grasping speed, and natural scholastic aptitude."}
Paragraph 2 (5–6 lines, NO REMEDIES): ${isInfant ? "Loving emotional security in the home, maternal soothing, peaceful colors, and unhurried developmental rhythms." : "Supportive study atmosphere at home, curiosity cultivation, and constructive parental guidance."}
Paragraph 3 (5–6 lines, NO REMEDIES): Emerging cognitive milestones, scholastic curiosity, and learning rhythm over the next 1–3 years (strictly no remedies).
Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED COGNITIVE & SCHOLASTIC NURTURING starting with 【...】: STRICT MANDATE: NO DOSHA DETECTED—DO NOT PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about the ${isInfant ? "infant's natural developmental curiosity, responsive smiles, sensory play, and peaceful nurturing environment" : "child's natural learning rhythm, reading curiosity, uncluttered study sanctuary, and academic flourishing"}.

${JSON_RULE}
{"marriage":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : isElder ? `${header(
    input,
    "bhavishyaElderCompanionship",
    "You are a revered Vedic master astrologer providing a spiritually serene reading on Sacred Elderhood, Peace of Mind, Devotion, and Gratitude for revered elder " + input.name + "."
  )}
CRITICAL SACRED ELDERHOOD MANDATE (75+ YEARS):
The native is a venerable elder (${Math.floor(input.ageYears)} years old). Treat with deepest spiritual devotion and reverence. Focus on sacred contemplation, spiritual liberation (Moksha orientation), lifelong gratitude, quiet domestic contentment, peace of mind, and the protective grace of their life's dharmic deeds. NEVER mention wedding proposals, seeking marriage, or dating.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\n\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS. Speak directly to 'you'.
- STRICT FORMATTING MANDATE: ABSOLUTELY ZERO PARENTHESES OR BRACKETS like '(7th house)', '7ನೇ ಮನೆ', '(ತುಲಾ)', or 'Bhava 7' in your output text!
7th House Sign: ${h7.sign}. 7th House Lord: ${h7.lordStr} placed ${h7.lordWhere}. Vivahakaraka: ${input.gender === "Female" ? "Guru (Jupiter)" : "Shukra (Venus)"}. Running ${dashaLine}.
Paragraph 1 (5–6 lines, NO REMEDIES): Peaceful soul companionship, lifelong emotional serenity, and sacred domestic peace under running ${dashaLine}.
Paragraph 2 (5–6 lines, NO REMEDIES): Tranquil daily routine, prayerful contemplation, mutual care and companionship in serene elder years.
Paragraph 3 (5–6 lines, NO REMEDIES): Blessings of longevity, spiritual equanimity, deep family reverence, and sacred peace over the next 1–3 years (strictly no remedies).
Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED SACRED ELDER COMPANIONSHIP & SPIRITUAL SHIELD starting with 【...】: Write 100% about the elder's personal spiritual peace, serene mindset, mutual devotion, and lifelong sacred fulfillment.

${JSON_RULE}
{"marriage":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : isSenior ? `${header(
    input,
    "bhavishyaSeniorCompanionship",
    "You are a revered Vedic master astrologer providing an in-depth reading on Companionship, Domestic Harmony, and Mutual Care for senior native " + input.name + "."
  )}
CRITICAL SENIOR CITIZEN MANDATE (60–74 YEARS):
The native is a respected senior citizen (${Math.floor(input.ageYears)} years old). Treat with profound reverence. Focus on lifelong spiritual companionship, domestic serenity, mutual health care, and peaceful household harmony. NEVER suggest wedding proposals or matchmaking.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\n\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS. Speak directly to 'you'.
- STRICT FORMATTING MANDATE: ABSOLUTELY ZERO PARENTHESES OR BRACKETS like '(7th house)', '7ನೇ ಮನೆ', '(ತುಲಾ)', or 'Bhava 7' in your output text!
7th House Sign: ${h7.sign}. 7th House Lord: ${h7.lordStr} placed ${h7.lordWhere}. Vivahakaraka: ${input.gender === "Female" ? "Guru (Jupiter)" : "Shukra (Venus)"}. Running ${dashaLine}.
Paragraph 1 (5–6 lines, NO REMEDIES): Lifelong emotional companionship, mutual understanding, and spiritual peace at home under running ${dashaLine}.
Paragraph 2 (5–6 lines, NO REMEDIES): Mutual health care, calm domestic rhythms, standing as a revered pillar for the entire family.
Paragraph 3 (5–6 lines, NO REMEDIES): Serene evening years, deepening soul bond, and peaceful family gatherings over the next 1–3 years (strictly no remedies).
${hasMarriageDosha
  ? `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಸಾಂಗತ್ಯ ಶಾಂತಿ】 / 【Dosha Analysis & Companionship Shanti】): Analyze subtle 7th house planetary friction affecting companionship or spouse's vitality, and prescribe specific Vedic remedies at Sri Kshetra Gokarna Mahabaleshwara.`
  : `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED COMPANIONSHIP & DOMESTIC SERENITY SHIELD starting with 【...】 (e.g. 【ದಾಂಪತ್ಯ ಸೌಹಾರ್ದತೆ & ಸಾಂಗತ್ಯ ರಕ್ಷಾ ಕವಚ】 / 【Companionship & Domestic Serenity Shield】): STRICT MANDATE: NO DOSHA DETECTED—DO NOT MENTION OR PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about the native's own personal lived reality, mutual care, calm companionship, emotional warmth, sharing decades of trust, and serene evenings together.`
}

${JSON_RULE}
{"marriage":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : isEarlyYouth ? `${header(
    input,
    "bhavishyaEarlyYouthFocus",
    "You are a revered Vedic master astrologer providing an in-depth reading on Adolescent Focus, Emotional Balance, and Concentration for student " + input.name + "."
  )}
CRITICAL SCHOOL / ADOLESCENT MANDATE (12–16 YEARS):
The native is a school student (${Math.floor(input.ageYears)} years old). Focus on study concentration, memory retention, emotional composure, self-discipline, and respectful conduct towards parents and teachers. NEVER suggest marriage timing or romantic matchmaking.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\n\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES).
- STRICT MANDATE: ABSOLUTELY ZERO REMEDIES IN PARAS 1-3. ZERO BRACKETS/PARENTHESES.
Lagna: ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}). Moon Sign: ${rashiName(input.moonRashiIndex, lang)}. Running ${dashaLine}.
Paragraph 1 (5–6 lines, NO REMEDIES): Adolescent emotional composure, focus in secondary school, and concentration stamina.
Paragraph 2 (5–6 lines, NO REMEDIES): Constructive peer relationships, steering clear of digital distractions, and building strong ethical character.
Paragraph 3 (5–6 lines, NO REMEDIES): Scholastic progress, examination composure, and character maturation over the next 1–3 years (strictly no remedies).
Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED STUDENT FOCUS SHIELD starting with 【...】: Write 100% about the student's personal concentration, self-discipline, goal clarity, and noble moral character.

${JSON_RULE}
{"marriage":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : isCollegeYouth ? `${header(
    input,
    "bhavishyaCollegeYouthFocus",
    "You are a revered Vedic master astrologer providing an in-depth reading on Higher Education Focus, Goal Clarity, and Character for youth " + input.name + "."
  )}
CRITICAL YOUTH / COLLEGE MANDATE (17–21 YEARS):
The native is a college student / youth (${Math.floor(input.ageYears)} years old). Focus on higher studies, competitive entrance exams, career foundation, avoiding premature distractions, and developing strong inner composure. NEVER suggest marriage timing or romantic matchmaking.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\n\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES).
- STRICT MANDATE: ABSOLUTELY ZERO REMEDIES IN PARAS 1-3. ZERO BRACKETS/PARENTHESES.
Lagna: ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}). Moon Sign: ${rashiName(input.moonRashiIndex, lang)}. Running ${dashaLine}.
Paragraph 1 (5–6 lines, NO REMEDIES): Mental clarity, intellectual stamina for college curricula, and emotional resilience against exam stress.
Paragraph 2 (5–6 lines, NO REMEDIES): Positive friendships, avoiding emotional distractions, self-reliance, and cultivating professional ambition.
Paragraph 3 (5–6 lines, NO REMEDIES): Graduating milestones, entrance exam success, and foundational vocational clarity over the next 1–3 years (strictly no remedies).
Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED HIGHER EDUCATION & FOCUS SHIELD starting with 【...】: Write 100% about the youth's personal focus, analytical skills, exam composure, and ambitious career foundation.

${JSON_RULE}
{"marriage":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : (() => {
    const d = getMarriageDirectives();
    return `${header(
      input,
      "bhavishyaMarriage",
      "You are a revered Vedic master astrologer providing an in-depth, authentic reading on Marriage, Compatibility, and Partnerships for " + input.name + "."
    )}
DEVOTEE INQUEST QUESTION TO DIRECTLY ADDRESS AND ANSWER:
"${marQuestion}"

DEVOTEE INQUEST QUESTION TO DIRECTLY ADDRESS AND ANSWER:
"${chdQuestion}"

CRITICAL MANDATE FOR ${d.statusDesc}:
Write exhaustive, deeply personalized astrological analysis strictly based on ${input.name}'s Janma Kundali.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\n\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS. Speak directly to 'you'.
- STRICT FORMATTING RULE: ABSOLUTELY ZERO PARENTHESES OR BRACKETS like '(7th house)', '7ನೇ ಮನೆ (ವೃಶ್ಚಿಕ)', '(ತುಲಾ)', or 'Bhava 7' in your output text! Weave all house names, signs, and planetary placements naturally into fluent, literary Vedic prose.

Marriage & Partnerships Context:
- Native Status: ${d.statusDesc}.
- 7th House Sign: ${h7.sign}. 7th House Lord: ${h7.lordStr} placed ${h7.lordWhere}.
- Occupants of 7th House: ${h7.occStr}.
- Vivahakaraka: ${input.gender === "Female" ? `Guru (Jupiter) placed ${formatPlacementText(jupiterPlacement)}` : `Shukra (Venus) placed ${formatPlacementText(venusPlacement)}`}.
- Kuja/Manglik: ${input.isManglikCancelled ? `Kuja Dosha CANCELLED / NEUTRALIZED via Parashari Apavada (${input.manglikCancellationReason}). Do not prescribe remedies for delay.` : isManglik ? `Yes, Mars placed ${formatPlacementText(marsPlacement)} causing Kuja Dosha` : "No Kuja Dosha"}.
- Direction of Partner: ${spouseDirection}.
- Running Period: ${dashaLine}.
- Transits: Guru transit ${guruTransit ? guruTransit.houseFromMoon : 9} from Chandra (${isGuruBala ? "Guru Bala active" : "requiring devotion"}), Shani transit ${shaniTransit ? shaniTransit.houseFromMoon : 10} from Chandra.

Paragraph 1 (5–6 lines, NO REMEDIES): ${d.p1}
Paragraph 2 (5–6 lines, NO REMEDIES): ${d.p2}
Paragraph 3 (5–6 lines, NO REMEDIES): ${d.p3}
Paragraph 4 (5–6 lines, starting with 【...】): ${d.p4Callout}

${JSON_RULE}
{"marriage":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`;
  })();

  const bhavishyaChildren = isChild ? `${header(
    input,
    "bhavishyaChildActivities",
    isInfant
      ? "You are a revered Vedic master astrologer providing an in-depth reading on Motor Play, Natural Curiosity, and Cheerful Vitality for infant " + input.name + "."
      : "You are a revered Vedic master astrologer providing an in-depth reading on Talents, Creative Activities, and Sports for child " + input.name + "."
  )}
CRITICAL CHILD HOROSCOPE MANDATE:
The native is a ${isInfant ? "tender infant/toddler" : "child"} (${Math.floor(input.ageYears)} years old). ${isInfant ? "Focus on motor coordination, sensory exploration, instinctive curiosity, and joyful cheerful play." : "Focus on extracurricular interests, sports, fine arts, hobbies, and active energy channeling."}
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\n\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS.
- STRICT FORMATTING MANDATE: ABSOLUTELY ZERO PARENTHESES OR BRACKETS like '(5th house)', '5ನೇ ಮನೆ', '(ಸಿಂಹ)', or 'Bhava 5' in your output text!
3rd House (Parakrama): ${getHouseInfo(3).sign}. 5th House: ${h5.sign}. Mars: placed ${formatPlacementText(marsPlacement)}. Venus: placed ${formatPlacementText(venusPlacement)}.
Paragraph 1 (5–6 lines, NO REMEDIES): ${isInfant ? "Motor agility, responsive playfulness, sensory exploration, and energetic curiosity." : "Physical vigor, athletic stamina, sports enthusiasm, and motor coordination."}
Paragraph 2 (5–6 lines, NO REMEDIES): ${isInfant ? "Gentle interactive games, rhythm, laughter, music, and joyful bonding with family." : "Creative inclinations, artistic expression, music, drawing, storytelling, and imaginative hobbies."}
Paragraph 3 (5–6 lines, NO REMEDIES): Future creative expansion, athletic skill development, and group participation over the next 1–3 years (strictly no remedies).
Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED TALENTS & CREATIVE EXPANSION starting with 【...】: STRICT MANDATE: NO DOSHA DETECTED—DO NOT PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about the ${isInfant ? "infant's cheerful nature, active sensory play, laughter, and natural physical milestones" : "child's positive extracurricular pursuits, artistic confidence, and team camaraderie"}.

${JSON_RULE}
{"children":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : isElder ? `${header(
    input,
    "bhavishyaElderLegacy",
    "You are a revered Vedic master astrologer providing a deeply reverent reading on Sacred Family Lineage, Generational Fulfillment, and Grandchildren for venerable elder " + input.name + "."
  )}
CRITICAL SACRED ELDERHOOD MANDATE (75+ YEARS):
The native is a venerable elder (${Math.floor(input.ageYears)} years old). Focus on generational continuity, pride in multiple generations of children and grandchildren, passing on spiritual samskaras, and peaceful elder fulfillment.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\n\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES).
- STRICT MANDATE: ABSOLUTELY ZERO REMEDIES IN PARAS 1-3. ZERO BRACKETS/PARENTHESES.
5th House Sign: ${h5.sign}. 5th House Lord: ${h5.lordStr} placed ${h5.lordWhere}. Putrakaraka Jupiter: placed ${formatPlacementText(jupiterPlacement)}.
Paragraph 1 (5–6 lines, NO REMEDIES): Grand fruition of Poorva Punya through generations of family continuity.
Paragraph 2 (5–6 lines, NO REMEDIES): Pure joy from children, grandchildren, and family gatherings; being a revered source of ancestral wisdom.
Paragraph 3 (5–6 lines, NO REMEDIES): Enduring family blessings, peace in generational legacy, and spiritual contentment over the next 1–3 years (strictly no remedies).
Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED SACRED LINEAGE & ANCESTRAL BLESSING SHIELD starting with 【...】: Write 100% about the elder's personal family pride, happiness in their descendants' thriving lives, and divine protective grace upon the entire lineage.

${JSON_RULE}
{"children":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : isSenior ? `${header(
    input,
    "bhavishyaSeniorLegacy",
    "You are a revered Vedic master astrologer providing an in-depth reading on Family Legacy, Continuity, and Joy of Grandchildren for senior native " + input.name + "."
  )}
CRITICAL SENIOR CITIZEN MANDATE (60–74 YEARS):
The native is a respected senior citizen (${Math.floor(input.ageYears)} years old). Focus on family lineage, joy and bonding with children and grandchildren, and passing down cultural wisdom.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\n\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES).
- STRICT MANDATE: ABSOLUTELY ZERO REMEDIES IN PARAS 1-3. ZERO BRACKETS/PARENTHESES.
5th House Sign: ${h5.sign}. 5th House Lord: ${h5.lordStr} placed ${h5.lordWhere}. Putrakaraka Jupiter: placed ${formatPlacementText(jupiterPlacement)}.
Paragraph 1 (5–6 lines, NO REMEDIES): Fruitful fruition of Poorva Punya through grown children well-settled in their lives and vocations.
Paragraph 2 (5–6 lines, NO REMEDIES): Joy of grandchildren (Poutra-Poutri sukha), warm intergenerational bonding, and peaceful family gatherings.
Paragraph 3 (5–6 lines, NO REMEDIES): Deepening lineage satisfaction, family gatherings, and blessed elder role over the next 1–3 years (strictly no remedies).
${hasSantanaDosha
  ? `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಸಂತತಿ ಶಾಂತಿ】 / 【Dosha Analysis & Lineage Shanti】): Analyze subtle afflictions affecting generational continuity or children's peace, and prescribe authentic Vedic remedies at Sri Kshetra Gokarna Mahabaleshwara.`
  : `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED GENERATIONAL CONTINUITY & LINEAGE SHIELD starting with 【...】 (e.g. 【ವಂಶೋದ್ಧಾರ & ಸಕಲ ಸಂತತಿ ರಕ್ಷಾ ಕವಚ】 / 【Generational Continuity & Lineage Shield】): STRICT MANDATE: NO DOSHA DETECTED—DO NOT PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about the native's personal family reality, joy of grown children's achievements, sweet bonding with grandchildren, and sense of pride in family legacy.`
}

${JSON_RULE}
{"children":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : isEarlyYouth ? `${header(
    input,
    "bhavishyaEarlyYouthStudies",
    "You are a revered Vedic master astrologer providing an in-depth reading on Secondary Education, Grasping Power, and Scholastic Aptitude for student " + input.name + "."
  )}
CRITICAL SCHOOL / ADOLESCENT MANDATE (12–16 YEARS):
The native is a school student (${Math.floor(input.ageYears)} years old). Focus on academic curriculum, grasping capacity, memory retention, and intellectual development. NEVER use words like 'progeny', 'children', or 'conception'.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\n\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES).
- STRICT MANDATE: ABSOLUTELY ZERO REMEDIES IN PARAS 1-3. ZERO BRACKETS/PARENTHESES.
5th House Sign: ${h5.sign}. 5th House Lord: ${h5.lordStr} placed ${h5.lordWhere}. Putrakaraka Jupiter: placed ${formatPlacementText(jupiterPlacement)}. Mercury: placed ${formatPlacementText(input.natalPlanets.find(p => p.graha === "Mercury"))}.
Paragraph 1 (5–6 lines, NO REMEDIES): Scholastic grasping power, academic curiosity, and memory retention in school subjects.
Paragraph 2 (5–6 lines, NO REMEDIES): Study habits, revision discipline, analytical thinking, and balancing homework with active play.
Paragraph 3 (5–6 lines, NO REMEDIES): Secondary school achievements, examination confidence, and intellectual growth over the next 1–3 years (strictly no remedies).
Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED SCHOLASTIC EXCELLENCE SHIELD starting with 【...】: Write 100% about the student's personal analytical reasoning, exam composure, scholarly discipline, and intellectual confidence.

${JSON_RULE}
{"children":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : isCollegeYouth ? `${header(
    input,
    "bhavishyaCollegeYouthStudies",
    "You are a revered Vedic master astrologer providing an in-depth reading on Higher Education, Scholastic Distinction, and Intellect for youth " + input.name + "."
  )}
CRITICAL YOUTH / COLLEGE MANDATE (17–21 YEARS):
The native is a college student (${Math.floor(input.ageYears)} years old). Focus on higher studies, competitive exams, memory retention, and academic distinctions. NEVER use the words 'progeny', 'children', or 'conception'.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\n\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES).
- STRICT MANDATE: ABSOLUTELY ZERO REMEDIES IN PARAS 1-3. ZERO BRACKETS/PARENTHESES.
5th House Sign: ${h5.sign}. 5th House Lord: ${h5.lordStr} placed ${h5.lordWhere}. Putrakaraka Jupiter: placed ${formatPlacementText(jupiterPlacement)}. Mercury: placed ${formatPlacementText(input.natalPlanets.find(p => p.graha === "Mercury"))}.
Paragraph 1 (5–6 lines, NO REMEDIES): Academic focus, memory retention, grasping complex college curricula, and competitive entrance preparation.
Paragraph 2 (5–6 lines, NO REMEDIES): Analytical reasoning, competitive test composure, strategic revision, and scholarly discipline.
Paragraph 3 (5–6 lines, NO REMEDIES): Scholastic milestones, degree/exam distinctions, and intellectual maturity over the next 1–3 years (strictly no remedies).
Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED SCHOLASTIC DISTINCTION & INTELLECTUAL SHIELD starting with 【...】: Write 100% about the student's personal analytical reasoning, exam composure, scholarly discipline, and intellectual confidence.

${JSON_RULE}
{"children":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : (() => {
    const d = getChildrenDirectives();
    return `${header(
      input,
      "bhavishyaChildren",
      "You are a revered Vedic master astrologer providing an in-depth, authentic reading on Children and Progeny for " + input.name + "."
    )}
CRITICAL MANDATE FOR ${d.statusDesc}:
Write exhaustive, deeply personalized astrological analysis strictly based on ${input.name}'s Janma Kundali.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\n\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS. Speak directly to 'you'.
- STRICT FORMATTING RULE: ABSOLUTELY ZERO PARENTHESES OR BRACKETS like '(5th house)', '5ನೇ ಮನೆ (ಸಿಂಹ)', '(ಧನು)', or 'Bhava 5' in your output text! Weave all house names, signs, and planetary placements naturally into fluent, literary Vedic prose.

Children & Progeny Context:
- Native Status: ${d.statusDesc}.
- 5th House Sign: ${h5.sign}. 5th House Lord: ${h5.lordStr} placed ${h5.lordWhere}.
- Occupants of 5th House: ${h5.occStr}.
- Putrakaraka Jupiter (Guru): placed ${formatPlacementText(jupiterPlacement)}.
- Progeny Transit: Jupiter transit ${guruTransit ? guruTransit.houseFromMoon : 9} from Chandra (${isGuruBala ? "Guru Bala active" : "testing phase"}). Running ${dashaLine}.

Paragraph 1 (5–6 lines, NO REMEDIES): ${d.p1}
Paragraph 2 (5–6 lines, NO REMEDIES): ${d.p2}
Paragraph 3 (5–6 lines, NO REMEDIES): ${d.p3}
Paragraph 4 (5–6 lines, starting with 【...】): ${d.p4Callout}

${JSON_RULE}
{"children":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`;
  })();

  const bhavishyaCareer = isChild ? `${header(
    input,
    "bhavishyaChildFoundation",
    isInfant
      ? "You are a revered Vedic master astrologer providing an in-depth reading on Foundational Samskaras, Trust, and Gentle Upbringing for infant " + input.name + "."
      : "You are a revered Vedic master astrologer providing an in-depth reading on Future Foundation, Character, and Moral Discipline for child " + input.name + "."
  )}
CRITICAL CHILD HOROSCOPE MANDATE:
The native is a ${isInfant ? "tender infant/toddler" : "child"} (${Math.floor(input.ageYears)} years old). ${isInfant ? "Focus on building foundational trust, soothing maternal care, and gentle auspicious samskaras." : "Focus on building strong ethical foundations, noble character, and childhood discipline. DO NOT discuss adult employment or corporate jobs."}
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\\n\\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS.
Paragraph 1 (5–6 lines, NO REMEDIES): ${isInfant ? "Instinctive trust, calm emotional disposition, responsive temperament, and joyful presence." : "Ethical orientation, honesty, moral values, and innate leadership potential."}
Paragraph 2 (5–6 lines, NO REMEDIES): ${isInfant ? "Maternal soothing, gentle family routines, peaceful bedtime rituals, and secure attachment." : "Developing good daily habits, respect towards teachers and elders, and perseverance."}
Paragraph 3 (5–6 lines, NO REMEDIES): Maturing sense of responsibility, character growth, and dharmic values over the next 1–3 years (strictly no remedies).
Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED FOUNDATION GUIDANCE starting with 【...】: STRICT MANDATE: NO DOSHA DETECTED—DO NOT PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about ${isInfant ? "the infant's calm temperament, radiant presence, and loving emotional security in the home" : "instilling timeless Dharmic ideals, patience, and noble life orientation"}.

${JSON_RULE}
{"career":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : isSenior ? `${header(
    input,
    "bhavishyaSeniorLeadership",
    "You are a revered Vedic master astrologer providing an in-depth reading on Mentorship, Dharmic Leadership, and Social Respect for senior native " + input.name + "."
  )}
CRITICAL SENIOR CITIZEN MANDATE:
The native is a senior citizen (${Math.floor(input.ageYears)} years old). Focus on mentorship, dharmic activities, philanthropy, and societal guidance. NEVER suggest seeking new corporate jobs or job changes.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\\n\\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS. Speak directly to 'you'.
10th House: ${h10.sign} (Lord ${h10.lordStr} placed ${h10.lordWhere}). Saturn: placed ${formatPlacementText(saturnPlacement)}.
Paragraph 1 (5–6 lines, NO REMEDIES): Societal respect, honored standing as a community elder, and sharing wisdom gained over decades.
Paragraph 2 (5–6 lines, NO REMEDIES): Dharmic leadership, guiding younger family members, charitable work, and spiritual satisfaction.
Paragraph 3 (5–6 lines, NO REMEDIES): Enduring life legacy, peaceful spiritual fulfillment, and honored mentorship over the next 1–3 years (strictly no remedies).
${hasCareerDosha
  ? `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಕರ್ಮ ಶಾಂತಿ】 / 【Dosha Analysis & Dharmic Peace】): Analyze subtle 10th house or Saturn afflictions, and prescribe authentic Vedic remedies at Sri Kshetra Gokarna Mahabaleshwara.`
  : `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED MENTORSHIP & DHARMIC LEADERSHIP SHIELD starting with 【...】 (e.g. 【ಧರ್ಮ ಮಾರ್ಗದರ್ಶನ & ಆಧ್ಯಾತ್ಮಿಕ ಗೌರವ ರಕ್ಷಾ ಕವಚ】 / 【Dharmic Leadership & Social Respect Shield】): STRICT MANDATE: NO DOSHA DETECTED—DO NOT PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about the native's personal standing as an honored elder, trusted counselor to family and peers, and quiet satisfaction in life's achievements.`
}

${JSON_RULE}
{"career":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : isYouth ? `${header(
    input,
    "bhavishyaYouthCareerFoundation",
    "You are a revered Vedic master astrologer providing an in-depth reading on Future Vocational Direction and Career Foundation for youth " + input.name + "."
  )}
CRITICAL YOUTH / STUDENT MANDATE:
The native is a youth (${Math.floor(input.ageYears)} years old). Focus on discovering natural talents, career foundation, skill building, and professional aspirations.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\\n\\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS. Speak directly to 'you'.
10th House: ${h10.sign} (Lord ${h10.lordStr} placed ${h10.lordWhere}). Karmakaraka Saturn: placed ${formatPlacementText(saturnPlacement)}. Sun: dignity in chart.
Paragraph 1 (5–6 lines, NO REMEDIES): Innate career inclinations, vocational fields aligned with the 10th house, and natural skills.
Paragraph 2 (5–6 lines, NO REMEDIES): Developing professional competencies, practical internships, industry skills, and goal clarity.
Paragraph 3 (5–6 lines, NO REMEDIES): Career launching milestones, industry entry, and skill mastery over the next 1–3 years (strictly no remedies).
${hasCareerDosha
  ? `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಕರ್ಮ ಶಾಂತಿ】 / 【Dosha Analysis & Career Remedy】): Analyze detected career/study obstacles, and prescribe authentic Vedic remedies at Sri Kshetra Gokarna Mahabaleshwara.`
  : `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED VOCATIONAL DIRECTION & SKILL SHIELD starting with 【...】 (e.g. 【ವೃತ್ತಿ ಅಡಿಪಾಯ & ಕೌಶಲ್ಯ ರಕ್ಷಾ ಕವಚ】 / 【Career Foundation & Vocational Direction Shield】): STRICT MANDATE: NO DOSHA DETECTED—DO NOT PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about the youth's personal career aspirations, strategic skill acquisition, vocational clarity, and perseverance.`
}

${JSON_RULE}
{"career":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : `${header(
    input,
    "bhavishyaCareer",
    "You are a revered Vedic master astrologer providing an in-depth reading on Career, Vocation, and Professional Ascent for " + input.name + "."
  )}
DEVOTEE INQUEST QUESTION TO DIRECTLY ADDRESS AND ANSWER:
"${carQuestion}"

CRITICAL MANDATE:
Write exhaustive, deeply personalized analysis strictly based on ${input.name}'s Janma Kundali.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\\n\\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS. Speak directly to 'you'.

10th House Sign: ${h10.sign}. 10th House Lord: ${h10.lordStr} placed ${h10.lordWhere}.
Occupants of 10th House: ${h10.occStr}.
Karmakaraka Saturn (Shani): placed ${formatPlacementText(saturnPlacement)}.
Running period: ${dashaLine}.
Paragraph 1 (5–6 lines, NO REMEDIES): Professional stability, leadership prospects, vocational aptitude, and timing under running ${dashaLine}.
Paragraph 2 (5–6 lines, NO REMEDIES): Strategic workplace navigation, career growth, transitions, and public reputation.
Paragraph 3 (5–6 lines, NO REMEDIES): Future vocational trajectory, upcoming promotions, transitions, business expansion, and milestone timing over the next 1–3 years (strictly no remedies).
${hasCareerDosha
  ? `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಕರ್ಮ ಶಾಂತಿ】 / 【Dosha Analysis & Career Remedy】): Analyze the detected 10th house / Karma dosha, explain obstacle mechanisms, and detail Shani Shanti pooja, Dasharatha Stotram, and Rudrabhishekam at Sri Kshetra Gokarna Mahabaleshwara.`
  : `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED CAREER ASCENT & EXECUTIVE SHIELD starting with 【...】 (e.g. 【ವೃತ್ತಿ ಪ್ರಗತಿ & ನಾಯಕತ್ವ ರಕ್ಷಾ ಕವಚ】 / 【Career Ascent & Leadership Shield】): Write 100% about the native's personal professional reality, executive decision-making style, specific industry strengths, leadership acumen, professional respect earned, and vocational ascent.`
}

${JSON_RULE}
{"career":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`;

  const bhavishyaWealth = isChild ? `${header(
    input,
    "bhavishyaChildFamily",
    isInfant
      ? "You are a revered Vedic master astrologer providing an in-depth reading on Maternal Nurturing, Emotional Warmth, and Family Joy for infant " + input.name + "."
      : "You are a revered Vedic master astrologer providing an in-depth reading on Family Environment, Nurturing, and Auspicious Upbringing for child " + input.name + "."
  )}
CRITICAL CHILD HOROSCOPE MANDATE:
The native is a ${isInfant ? "tender infant/toddler" : "child"} (${Math.floor(input.ageYears)} years old). Focus on home atmosphere, parental affection, and emotional security. DO NOT discuss stock market, business investments, or commerce.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\\n\\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS.
2nd House (Kutumba): ${getHouseInfo(2).sign} (Lord ${getHouseInfo(2).lordStr} ${getHouseInfo(2).lordWhere}). 4th House (Matru/Sukha): ${getHouseInfo(4).sign}.
Paragraph 1 (5–6 lines, NO REMEDIES): Family warmth, emotional security, and harmonious home environment.
Paragraph 2 (5–6 lines, NO REMEDIES): Positive parental values, gentle guidance, and nurturing household atmosphere.
Paragraph 3 (5–6 lines, NO REMEDIES): Enduring domestic security, sibling unity, and family harmony over the next 1–3 years (strictly no remedies).
Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED FAMILY SANCTUARY starting with 【...】: STRICT MANDATE: NO DOSHA DETECTED—DO NOT PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about maintaining peaceful family rhythms, unconditional mutual affection, and joyful home harmony.

${JSON_RULE}
{"wealth":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : isSenior ? `${header(
    input,
    "bhavishyaSeniorWealthPreservation",
    "You are a revered Vedic master astrologer providing an in-depth reading on Wealth Preservation, Estate Peace, and Financial Security for senior native " + input.name + "."
  )}
CRITICAL SENIOR CITIZEN MANDATE:
The native is a senior citizen (${Math.floor(input.ageYears)} years old). Focus on financial preservation, safe retirement assets, estate security, and contentment. NEVER suggest aggressive speculations.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\\n\\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS. Speak directly to 'you'.
2nd House: ${h2.sign} (Lord ${h2.lordStr} placed ${h2.lordWhere}). 11th House: ${h11.sign}. Jupiter: placed ${formatPlacementText(jupiterPlacement)}.
Paragraph 1 (5–6 lines, NO REMEDIES): Financial security, safe asset consolidation, and retirement peace under running ${dashaLine}.
Paragraph 2 (5–6 lines, NO REMEDIES): Estate planning, safeguarding ancestral wealth, and providing generational stability.
Paragraph 3 (5–6 lines, NO REMEDIES): Unshakable material contentment, safe liquidity, and financial dignity over the next 1–3 years (strictly no remedies).
${hasWealthDosha
  ? `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಧನ ಶಾಂತಿ】 / 【Dosha Analysis & Financial Peace】): Analyze subtle financial afflictions affecting liquidity or property peace, and prescribe authentic Vedic remedies at Sri Kshetra Gokarna.`
  : `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED WEALTH PRESERVATION & RETIREMENT SHIELD starting with 【...】 (e.g. 【ಸಂಪತ್ತು ಸಂರಕ್ಷಣೆ & ಆರ್ಥಿಕ ರಕ್ಷಾ ಕವಚ】 / 【Wealth Preservation & Retirement Shield】): STRICT MANDATE: NO DOSHA DETECTED—DO NOT PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about the native's personal financial peace of mind, safe asset consolidation, estate clarity, and contentment.`
}

${JSON_RULE}
{"wealth":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : isYouth ? `${header(
    input,
    "bhavishyaYouthFinancialDiscipline",
    "You are a revered Vedic master astrologer providing an in-depth reading on Financial Discipline, Resource Management, and Practical Values for youth " + input.name + "."
  )}
CRITICAL YOUTH / STUDENT MANDATE:
The native is a student/youth (${Math.floor(input.ageYears)} years old). Focus on cultivating financial prudence, understanding the value of money, and avoiding wasteful expenditures.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\\n\\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS. Speak directly to 'you'.
2nd House: ${h2.sign} (Lord ${h2.lordStr} placed ${h2.lordWhere}). 11th House: ${h11.sign}.
Paragraph 1 (5–6 lines, NO REMEDIES): Developing prudent money habits, understanding family resources, and budgeting basics.
Paragraph 2 (5–6 lines, NO REMEDIES): Avoiding trend-driven impulse spending, cultivating smart saving habits early in life.
Paragraph 3 (5–6 lines, NO REMEDIES): Long-term financial prudence, self-investment, and resource discipline over the next 1–3 years (strictly no remedies).
${hasWealthDosha
  ? `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಆರ್ಥಿಕ ಶಿಸ್ತು】 / 【Dosha Analysis & Financial Discipline】): Analyze detected fiscal restlessness or expenditure friction, and prescribe authentic Vedic remedies at Sri Kshetra Gokarna.`
  : `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED FINANCIAL PRUDENCE & RESOURCE SHIELD starting with 【...】 (e.g. 【ಆರ್ಥಿಕ ಶಿಸ್ತು & ಸಂಪತ್ತಿನ ರಕ್ಷಾ ಕವಚ】 / 【Financial Discipline & Resource Shield】): STRICT MANDATE: NO DOSHA DETECTED—DO NOT PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about the youth's personal financial discipline, understanding true value, smart saving habits, and self-investment.`
}

${JSON_RULE}
{"wealth":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : `${header(
    input,
    "bhavishyaWealth",
    "You are a revered Vedic master astrologer providing an in-depth reading on Wealth, Assets, and Financial Destiny for " + input.name + "."
  )}
DEVOTEE INQUEST QUESTION TO DIRECTLY ADDRESS AND ANSWER:
"${wlhQuestion}"

CRITICAL MANDATE:
Write exhaustive, deeply personalized analysis strictly based on ${input.name}'s Janma Kundali.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\\n\\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS. Speak directly to 'you'.

2nd House (Accumulated Wealth): ${h2.sign} (Lord ${h2.lordStr} ${h2.lordWhere}, occupants: ${h2.occStr}).
11th House (Income & Gains): ${h11.sign} (Lord ${h11.lordStr} ${h11.lordWhere}, occupants: ${h11.occStr}).
Dhanakaraka Jupiter: placed ${formatPlacementText(jupiterPlacement)}.
Running period: ${dashaLine}.
Paragraph 1 (5–6 lines, NO REMEDIES): Financial accumulation, investments, property gains, and income growth under running ${dashaLine}.
Paragraph 2 (5–6 lines, NO REMEDIES): Liquidity planning, family prosperity, asset consolidation, and wealth preservation.
Paragraph 3 (5–6 lines, NO REMEDIES): Future financial trajectory, upcoming gainful periods, debt clearance, and material stability over the next 1–3 years (strictly no remedies).
${hasWealthDosha
  ? `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಧನ ಸಮೃದ್ಧಿ ಶಾಂತಿ】 / 【Dosha Analysis & Financial Shanti】): Analyze the detected financial affliction, obstacle resolution, and prescribe Lakshmi Kubera Aradhana and remedy at Sri Kshetra Gokarna.`
  : `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED WEALTH ACCUMULATION & ASSET SHIELD starting with 【...】 (e.g. 【ಧನ ಸಮೃದ್ಧಿ & ಆರ್ಥಿಕ ರಕ್ಷಾ ಕವಚ】 / 【Wealth Prosperity & Investment Shield】): Write 100% about the native's personal wealth accumulation habits, asset preservation, family financial security, investment prudence, and material peace of mind.`
}

${JSON_RULE}
{"wealth":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`;

  const bhavishyaHealth = isChild ? `${header(
    input,
    "bhavishyaChildHealth",
    isInfant
      ? "You are a revered Vedic master astrologer providing an in-depth reading on Infant Vitality, Natural Immunity, and Soothing Rest for infant " + input.name + "."
      : "You are a revered Vedic master astrologer providing an in-depth reading on Pediatric Health, Vitality, and Natural Immunity for child " + input.name + "."
  )}
CRITICAL CHILD HOROSCOPE MANDATE:
The native is a ${isInfant ? "tender infant/toddler" : "child"} (${Math.floor(input.ageYears)} years old). Focus on natural immunity, seasonal pediatric wellness, nutrition, and vital stamina.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\\n\\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS.
1st House: ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}). 6th House: ${h6.sign}. Moon & Sun dignity in chart.
Paragraph 1 (5–6 lines, NO REMEDIES): ${isInfant ? "Infant cellular immunity, seasonal warmth, delicate digestion, and physiological thriving." : "Natural physical immunity, seasonal vulnerability precautions, and vitality rhythms."}
Paragraph 2 (5–6 lines, NO REMEDIES): ${isInfant ? "Restful deep sleep, gentle mother's touch, wholesome nourishment, and calm soothing nursery rhythms." : "Balanced sleep schedules, nutritious wholesome foods, and active play outdoors."}
Paragraph 3 (5–6 lines, NO REMEDIES): Future growth stamina, metabolic balance, and energetic childhood wellness over the next 1–3 years (strictly no remedies).
${hasBalyaDosha
  ? `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ಬಾಲ್ಯ ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಆಯುಷ್ಯ ರಕ್ಷಾ ಶಾಂತಿ】 / 【Balya Dosha Analysis & Pediatric Health Shanti】): Analyze subtle Moon/Lagna planetary affliction, and give specific Vedic remedies at Sri Kshetra Gokarna Mahabaleshwara.`
  : `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED PEDIATRIC VITALITY & IMMUNITY SHIELD starting with 【...】: STRICT MANDATE: NO DOSHA DETECTED—DO NOT PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about the ${isInfant ? "infant's vigorous stamina, healthy weight gain, sound digestion, and radiant joyful vitality" : "child's natural physical constitution, energetic stamina, healthy growth rhythms, and robust vitality"}.`
}

${JSON_RULE}
{"health":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : isSenior ? `${header(
    input,
    "bhavishyaSeniorLongevity",
    "You are a revered Vedic master astrologer providing an in-depth reading on Longevity, Geriatric Wellness, and Health Preservation for senior native " + input.name + "."
  )}
CRITICAL SENIOR CITIZEN MANDATE:
The native is a senior citizen (${Math.floor(input.ageYears)} years old). Focus on longevity, gentle physical wellness, emotional equanimity, and restful sleep.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\\n\\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS. Speak directly to 'you'.
1st House: ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}). 6th House: ${h6.sign}. 8th House (Ayushya): ${h8.sign}. Running ${dashaLine}.
Paragraph 1 (5–6 lines, NO REMEDIES): Physical health stability, joint and digestive care, and maintaining stamina in senior years.
Paragraph 2 (5–6 lines, NO REMEDIES): Emotional peace, regular sleep hygiene, gentle walking, and Pranayama breathing.
Paragraph 3 (5–6 lines, NO REMEDIES): Long-term physical resilience, metabolic stability, and restful vitality over the next 1–3 years (strictly no remedies).
${hasHealthDosha
  ? `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಆರೋಗ್ಯ ರಕ್ಷಾ ಶಾಂತಿ】 / 【Dosha Analysis & Health Shield Shanti】): Analyze detected geriatric afflictions affecting joints, digestion, or vitality, and prescribe authentic Mrityunjaya homa at Sri Kshetra Gokarna Mahabaleshwara.`
  : `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED LONGEVITY & GERIATRIC WELLNESS SHIELD starting with 【...】 (e.g. 【ಆಯುಷ್ಯ ವೃದ್ಧಿ & ಸ್ವಾಸ್ಥ್ಯ ರಕ್ಷಾ ಕವಚ】 / 【Longevity & Geriatric Wellness Shield】): STRICT MANDATE: NO DOSHA DETECTED—DO NOT PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about the native's personal physical comfort, gentle daily mobility rhythms, restful sleep, serene mindset, and longevity vitality.`
}

${JSON_RULE}
{"health":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : isYouth ? `${header(
    input,
    "bhavishyaYouthFitness",
    "You are a revered Vedic master astrologer providing an in-depth reading on Vitality, Fitness, and Lifestyle Balance for youth " + input.name + "."
  )}
CRITICAL YOUTH / STUDENT MANDATE:
The native is a youth (${Math.floor(input.ageYears)} years old). Focus on physical vigor, sports stamina, mental equanimity, and balancing screen time with restful sleep.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\\n\\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS. Speak directly to 'you'.
1st House: ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}). 6th House: ${h6.sign}. Sun & Mars dignity.
Paragraph 1 (5–6 lines, NO REMEDIES): Physical stamina, active fitness habits, metabolism, and endurance.
Paragraph 2 (5–6 lines, NO REMEDIES): Mental equanimity, mitigating screen fatigue, eye care, and regular sleep schedule.
Paragraph 3 (5–6 lines, NO REMEDIES): Robust athletic vitality, metabolic resilience, and energetic lifestyle balance over the next 1–3 years (strictly no remedies).
${hasHealthDosha
  ? `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಆರೋಗ್ಯ ಶಾಂತಿ】 / 【Dosha Analysis & Health Shanti】): Analyze detected planetary friction affecting physical energy or sleep, and prescribe authentic Vedic remedies at Sri Kshetra Gokarna Mahabaleshwara.`
  : `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED YOUTH FITNESS & LIFESTYLE SHIELD starting with 【...】 (e.g. 【ಯುವ ಚೈತನ್ಯ & ಆರೋಗ್ಯ ರಕ್ಷಾ ಕವಚ】 / 【Youth Fitness & Vitality Shield】): STRICT MANDATE: NO DOSHA DETECTED—DO NOT PRESCRIBE ANY PARIHARA, REMEDY, POOJA, ARCHANA, MANTRA JAPA, OR TEMPLE VISIT. Write 100% about the youth's personal physical endurance, sports stamina, metabolic vigor, and balanced digital-sleep routine.`
}

${JSON_RULE}
{"health":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`
  : `${header(
    input,
    "bhavishyaHealth",
    "You are a revered Vedic master astrologer providing an in-depth reading on Health, Vitality, and Longevity for " + input.name + "."
  )}
DEVOTEE INQUEST QUESTION TO DIRECTLY ADDRESS AND ANSWER:
"${hltQuestion}"

CRITICAL MANDATE:
Write exhaustive, deeply personalized analysis strictly based on ${input.name}'s Janma Kundali.
Write STRICTLY FOUR (4) SECTIONS / PARAGRAPHS separated by double newlines (\\n\\n):
- PARAGRAPHS 1, 2, AND 3 MUST BE THREE (3) EXPANSIVE NARRATIVE PARAGRAPHS (EACH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx. 75-120 words / 400-600 characters).
- STRICT MANDATE FOR PARAGRAPHS 1, 2, AND 3: ABSOLUTELY ZERO REMEDIES, NO POOJA, NO JAPA, NO ARCHANA, NO MANTRA, NO GEMSTONES, AND NO TEMPLE VISITS. Speak directly to 'you'.

1st House (Lagna / Physical Constitution): ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}).
6th House (Roga Sthana): ${h6.sign} (Lord ${h6.lordStr} ${h6.lordWhere}).
Sun (Vitality) and Moon (Mental Equanimity) dignity in chart.
Running period: ${dashaLine}.

CRITICAL HEALTH REALITY MANDATE:
- Lagna governing area: ${lagnaAnatomy}.
- 6th House governing area: ${rogaAnatomy}.
Mention explicitly what bodily vulnerabilities and physical sensations ${input.name} has been facing or is prone to (specifically ${rogaAnatomy}, ${lagnaAnatomy}, sleep changes, or digestive sensitivities under stress) so they are stunned by the lifelike 100% accuracy of the reading.
Paragraph 1 (5–6 lines, NO REMEDIES): Physical constitution, vitality, seasonal wellness precautions, and metabolic stamina.
Paragraph 2 (5–6 lines, NO REMEDIES): Mental equanimity, stress management, sleep quality, and daily Ayurvedic lifestyle.
Paragraph 3 (5–6 lines, NO REMEDIES): Future physical stamina, seasonal wellness precautions, bodily rejuvenation, and long-term vitality rhythms (strictly no remedies).
${hasHealthDosha
  ? `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಆರೋಗ್ಯ ರಕ್ಷಾ ಶಾಂತಿ】 / 【Dosha Analysis & Health Shield Shanti】): Analyze the detected 6th/8th house roga affliction, and prescribe Mahamrityunjaya japa, Dhanvantari prayer, and Gokarna Mrityunjaya homa.`
  : `Paragraph 4 (5–6 lines, starting with 【...】): DEDICATED VITALITY & HEALTH SHIELD starting with 【...】 (e.g. 【ಆರೋಗ್ಯ ಸಂರಕ್ಷಣೆ & ದೈಹಿಕ ರಕ್ಷಾ ಕವಚ】 / 【Vitality Preservation & Wellness Shield】): Write 100% about the native's personal physical constitution, bodily vulnerabilities/sensations (${lagnaAnatomy}, ${rogaAnatomy}), metabolic stamina, and balanced lifestyle rhythms (5–6 full lines describing their actual physical sensations and vitality so they feel 'yes, this is happening, this is 100% for me').`
}

${JSON_RULE}
{"health":"four paragraphs: 3 paragraphs of 5-6 lines each without remedies, followed by paragraph 4 starting with 【...】"}`;

  const bhavishyaAnnualForecast = `${header(
    input,
    "bhavishyaAnnualForecast",
    "You are a revered Vedic master astrologer composing a 100% mathematically accurate, deeply emotional 1-year destiny forecast for devotee " + input.name + " based on their Janma Kundali, running Dasha-Bhukti, and upcoming Gochara."
  )}
CRITICAL 100% 1-YEAR DESTINY & EMOTIONAL FORECAST ACCURACY MANDATE:
Write an exceptionally moving, intimate, and 100% astrologically accurate forecast covering the next 12 MONTHS (1 full year) for ${input.name}. ZERO generic statements.
Address the devotee with deep warmth and empathy ("ನೀವು" / "you"). Touch upon their inner unspoken burdens and provide absolute clarity on what they can expect in this upcoming year.

Write STRICTLY FOUR (4) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (approx. 75-100 words / 350-500 characters per paragraph, totaling 1,400+ characters).

Astrological Context:
- Janma Lagna: ${h1.sign} (Lord ${h1.lordStr} in ${h1.lordWhere}).
- Moon Sign (Janma Rashi): ${rashiName(input.moonRashiIndex, lang)} (${nakshatraName(input.moonNakshatraIndex, lang)} Nakshatra).
- Active Mahadasha & Antardasha: ${dashaLine}.
- Key 1-Year Gochara Highlights:
  * Jupiter (Guru) transit: In house ${guruTransit ? guruTransit.houseFromMoon : 9} from Moon (${isGuruBala ? "favorable Guru Bala active" : "requiring spiritual devotion"}).
  * Saturn (Shani) transit: In house ${shaniTransit ? shaniTransit.houseFromMoon : 10} from Moon.
  * Rahu-Ketu transit axis across 1-year window.

Strict 4-Paragraph Structure:
Paragraph 1 (Emotional Space & Dasha-Bhukti Initiation):
Acknowledge the emotional resilience, fatigue, or silent struggles ${input.name} has carried over recent times. Describe how the running ${dashaLine} acts as a profound healing and re-energizing catalyst over the next 12 months, shifting their mindset from uncertainty to grounded inner confidence.

Paragraph 2 (Career, Material Expansion & Financial Milestones):
Explain specific breakthroughs, professional stabilization, and financial gains over this 1-year cycle under the divine glance of Gochara Guru and Shani. Mention favorable timings for investments, new projects, or career/business expansion.

Paragraph 3 (Family Bonds, Domestic Peace & Wellbeing Rhythm):
Analyze the emotional climate at home, healing of relationships with family/spouse, and maintaining physical and mental vitality. Describe how domestic harmony will flourish and provide reassurance against minor temporary worries.

Paragraph 4 (Crucial Turning Points & Auspicious Guidance):
Must start with 【...】 (e.g. 【ದೈವಿಕ ಸಂಕಲ್ಪ & ವಾರ್ಷಿಕ ವಿಜಯ ಸಾಧನೆ】 / 【1-Year Destiny Triumph & Sacred Divine Guidance】): Detail the most auspicious seasons/months in this 1 year to take vital life steps, caution against unneeded haste, and recommend sincere prayer at Sri Kshetra Gokarna Mahabaleshwara to manifest victory.

${JSON_RULE}
{"annualForecast":"four paragraphs of 5-6 lines each"}`;

  const summary = `${header(
    input,
    "summary",
    "You are a revered Vedic master astrologer closing the reading for " + input.name + ", synthesizing their chart with 100% astronomical accuracy, profound personal warmth, wisdom, and spiritual authority."
  )}
CRITICAL 100% SYNTHESIS & ACCURACY REQUIREMENT:
MUST BE 100% GROUNDED in computed placements, running Dasha, and Gokarna blessings. ZERO generic statements.
Speak directly and intimately to ${input.name} as a caring spiritual mentor.
Do NOT write academic descriptions of astrological houses (such as listing Kendra or Trikona numbers) or generic textbook statements.
Write EXACTLY THREE (3) SUBSTANTIAL, DEEPLY PERSONAL AND INSPIRING PARAGRAPHS (EACH PARAGRAPH CONTAINING AT LEAST 5 TO 6 FULL LINES, approx 75-100 words / 350-500 characters) synthesizing their reading:
- Paragraph 1 (Personal Life Synthesis): Address ${input.name} directly. Synthesize their unique Lagna (${h1.sign}), Moon (${rashiName(input.moonRashiIndex, lang)}), and running ${dashaLine}. Acknowledge their past perseverance, validate their life's journey, and affirm their inner moral strength.
- Paragraph 2 (The Singular Priority for the Year Ahead): Given their age (${Math.floor(input.ageYears)}), life stage, and planetary weather, identify the ONE single most important life focus for the coming year (${input.ageYears >= 60 ? 'health vitality, peaceful contemplation, and harmonious family guidance' : input.ageYears < 23 ? 'disciplined educational focus, emotional resilience, and steady skill-building' : (maritalSel === 'married' && childrenSel === 'no_children' ? 'strengthening marital unity, patient prayers and healthy preparation for progeny, and steady financial stability' : 'strategic financial consolidation, emotional patience at home, and disciplined career focus')}).
- Paragraph 3 (Loving Spiritual Blessing): Close with an uplifting, compassionate blessing from the sacred tradition of Sri Kshetra Gokarna, inspiring ${input.name} to move forward with unshakeable faith, peace of mind, and divine protection.

${JSON_RULE}
{"summary":[{"impact":"three paragraphs of 5-6 lines each"}]}`;

  const mHouse = input.maandiHouse || 1;
  const mRashiStr = rashiName(input.maandiRashiIndex ?? null, lang);

  const maandiInquest = `${header(
    input,
    "maandiInquest",
    "You are an enlightened, compassionate Vedic master astrologer providing an emotionally touching, deeply personal karmic soul inquest for devotee " + input.name + "."
  )}
CRITICAL MANDATE - READ WITH UTMOST CARE:
1. STRICTLY FORBIDDEN WORDS: NEVER use the word "Maandi" or "Gulika" or "Upagraha" anywhere in the heading or narrative. Do NOT state that this section is caused by a shadow planet or astrological entity.
2. DYNAMIC TITLE: Create an evocative, empowering, and deeply personalized title in the target language (${lang}) that mirrors ${input.name}'s real-life perspective and soul journey (for example: based on their ${mHouse}th house themes like inner resilience, financial vigilance, domestic peace, career mastery, or spiritual transcendence).
3. EMOTIONAL TOUCH & DEPTH: This is a direct, intimate, empathetic dialogue. Write STRICTLY TWO (2) SUBSTANTIAL PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 6 to 7 FULL LINES (approx. 75-100 words / 350-500 characters per paragraph). Speak directly to 'you' (${input.name}).
4. PARAGRAPH 1 (Lived Reality & Subconscious Struggle): Describe what ${input.name} has been quietly carrying inside their heart—the feeling of running into obstacles right at the 99% mark before completion, the silent emotional weight, solitary battles, and unvoiced burdens they never reveal to the outside world. When they read this, they MUST feel: "Yes, this is exactly what is happening in my life."
5. PARAGRAPH 2 (Spiritual Breakthrough & Divine Awakening): Reveal the profound silver lining—how this intense pressure is the divine crucible refining their soul, the precise attitude shift and faith needed to dissolve this knot, and the benevolent blessing of Lord Gokarna Mahabaleshwara providing divine armor and peace.

Natal Context:
- Native Name: ${input.name}
- Natal Ascendant (Lagna): ${h1.sign}
- Natal Moon Sign: ${rashiName(input.moonRashiIndex, lang)}
- Running Period: ${dashaLine}
- Inquest Focus: ${mHouse}th House (${mRashiStr})

${JSON_RULE}
{"title": "evocative personal title without the word Maandi or Gulika", "paragraph1": "first paragraph of at least 6-7 lines", "paragraph2": "second paragraph of at least 6-7 lines"}`;

  const dashaGocharaCompass = `${header(
    input,
    "dashaGocharaCompass",
    "You are a revered master Vedic astrologer of Baggona Panchanga rooted in Sri Kshetra Gokarna, revealing the Sovereign Dasha-Gochara Synthesis: Shani-Guru Transit Compass & Golden Karma Windows."
  )}
CRITICAL MANDATE:
Synthesize the native's birth chart (Lagna: ${h1.sign}, Moon: ${rashiName(input.moonRashiIndex, lang)}), running period (${dashaLine}), and live sky transits (Saturn and Jupiter).
Provide a complete JSON response strictly in the target language (${lang}) with:
1. "title": Evocative master title for the chapter.
2. "subtitle": Auspicious Sanskrit or devotional phrase.
3. "shaniBadge": {"title": "title", "status": "transit status", "houseText": "house details", "isAdverse": true/false}
4. "guruBadge": {"title": "title", "status": "guru bala status", "houseText": "house details", "isBenefic": true/false}
5. "dashaBadge": {"title": "title", "eraText": "active mahadasha-bhukti", "confluenceText": "astrological synergy"}
6. "pariharaBadge": {"title": "title", "sankalpaText": "revered temple seva at Sri Kshetra Gokarna", "templeText": "sanctorum name"}
7. "pillars": {
     "career": {"title": "title", "text": "career guidance"},
     "wealth": {"title": "title", "text": "wealth guidance"},
     "family": {"title": "title", "text": "family guidance"},
     "shield": {"title": "title", "text": "protection guidance"}
   }
8. "paragraph1": In-depth narrative of at least 6-8 lines synthesizing Lagna, Moon, Dasha, and Saturn.
9. "paragraph2": In-depth narrative of at least 6-8 lines explaining Jupiter Guru Bala and planetary synergy.
10. "paragraph3": In-depth narrative of at least 6-8 lines with actionable guidance, golden karma windows, and Sri Kshetra Gokarna blessings.

Natal & Transit Context:
- Native Name: ${input.name}
- Natal Lagna: ${h1.sign}
- Natal Moon Sign: ${rashiName(input.moonRashiIndex, lang)}
- Running Period: ${dashaLine}
- Transits: ${input.transits.map(t => `${grahaName(t.graha, lang)} in ${rashiName(t.rashiIndex, lang)} (${t.houseFromMoon}th from Moon)`).join(", ")}

${JSON_RULE}
{"title": "string", "subtitle": "string", "shaniBadge": {"title": "string", "status": "string", "houseText": "string", "isAdverse": false}, "guruBadge": {"title": "string", "status": "string", "houseText": "string", "isBenefic": true}, "dashaBadge": {"title": "string", "eraText": "string", "confluenceText": "string"}, "pariharaBadge": {"title": "string", "sankalpaText": "string", "templeText": "string"}, "pillars": {"career": {"title": "string", "text": "string"}, "wealth": {"title": "string", "text": "string"}, "family": {"title": "string", "text": "string"}, "shield": {"title": "string", "text": "string"}}, "paragraph1": "string", "paragraph2": "string", "paragraph3": "string"}`;

  return {
    soulMirror,
    characteristics,
    darkSecret,
    currentPhase,
    bhavishya,
    bhavishyaMarriageChildren,
    bhavishyaCareerWealthHealth,
    bhavishyaMarriage,
    bhavishyaChildren,
    bhavishyaCareer,
    bhavishyaWealth,
    bhavishyaHealth,
    bhavishyaAnnualForecast,
    yogas,
    doshas,
    gochara,
    dashaGocharaCompass,
    timeline,
    summary,
    maandiInquest
  };
};
