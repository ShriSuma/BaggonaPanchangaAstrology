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
  GRAHA_L5,
  RASHI_L5,
  NAKSHATRA_L5,
  languageContract,
  noRepeatContract
} from "./premiumPdfLocale";

export type NatalPlacement = {
  graha: GrahaKey;
  rashiIndex: number;
  house: number;
  retrograde?: boolean;
  debilitated?: boolean;
  exalted?: boolean;
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
 * The shared factual block. Names are already localised, so the model copies
 * rather than translates them.
 */
export const buildChartFacts = (input: PremiumPromptInput): string => {
  const { lang } = input;

  const natal = input.natalPlanets
    .map(p => {
      const flags: string[] = [];
      if (p.retrograde) flags.push("retrograde");
      if (p.debilitated) flags.push("debilitated");
      if (p.exalted) flags.push("exalted");
      const suffix = flags.length ? ` [${flags.join(", ")}]` : "";
      return `  ${grahaName(p.graha, lang)} | ${rashiName(p.rashiIndex, lang)} | bhava ${p.house}${suffix}`;
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
    ...(input.isManglikCancelled ? [`Kuja Dosha Status: CANCELLED (${input.manglikCancellationReason})`] : []),
    ...(input.dashaSandhiActive ? [`Dasha Sandhi: ACTIVE TRANSITION (${input.dashaSandhiDetails || "within 9 months of transition"})`] : []),
    ...(input.maandiConjunctions && input.maandiConjunctions.length ? [`Maandi Conjunctions: ${input.maandiConjunctions.join(", ")}`] : []),
    "",
    "Graha placements at birth (graha | rashi | bhava):",
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
    `Money note: ${input.financeNote}`
  ].join("\n");
};

const header = (input: PremiumPromptInput, sectionKey: string, persona: string): string =>
  [
    persona,
    "",
    languageContract(input.lang),
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

CRITICAL REQUIREMENT:
Synthesize Chapter 1: The Sacred Soul Mirror & 3 Sovereign Truths of the Native's Soul.
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
Extra material for this chapter only:
Shadow side found by the engine: ${input.shadowSelf}
Karmic pattern found by the engine: ${input.karmicBaggage}

CRITICAL ACCURACY REQUIREMENT:
Write EXACTLY THREE (3) detailed paragraphs about this person's personality, core nature, and behavioral traits.
STRICT LENGTH RULE: EACH PARAGRAPH MUST CONTAIN AT LEAST 5 FULL, SUBSTANTIAL LINES OF TEXT (minimum 15 lines total for the section).
MUST BE 100% MATHEMATICALLY ACCURATE to the birth chart above.
- Paragraph 1: Synthesis of Lagna (${rashiName(input.lagnaRashiIndex, lang)}) and Chandra Rashi (${rashiName(input.moonRashiIndex, lang)}), alongside Janma Nakshatra (${nakshatraName(input.moonNakshatraIndex, lang)}${input.moonPada ? ` Pada ${input.moonPada}` : ""}) with its presiding Vedic deity archetype. Detail core temperament, sattvic qualities, and instinctive strengths.
- Paragraph 2: Lagna lord (Lagnesha) placement, dignity (exalted/debilitated/swakshetra), and aspects/occupants impacting the 1st house. Explain how this shapes physical vitality, moral conviction, and worldly posture.
- Paragraph 3: Worldly behavior, natural leadership instincts, running ${dashaLine}${input.dashaSandhiActive ? ", and Dasha Sandhi transition guidance" : ""}. ZERO generic statements or unverified claims.

${JSON_RULE}
{"characteristics":[{"impact":"paragraph one\\n\\nparagraph two\\n\\nparagraph three"}]}`;

  const darkSecret = input.ageYears < 8 ? "" : `${header(
    input,
    "darkSecret",
    "You are an authoritative Vedic astrologer revealing the hidden soul pattern strictly based on 8th/12th house placements and karmic planets."
  )}
Extra material for this chapter only:
Shadow: ${input.shadowSelf}
Karma: ${input.karmicBaggage}
${input.affairNote}

CRITICAL ACCURACY & DEEP EMOTIONAL CONNECTION REQUIREMENT:
Reveal the single deepest hidden truth of THIS chart — the niguda rahasya (ನಿಗೂಢ ರಹಸ್ಯ - hidden dark secret).
STRICT LENGTH RULE: Write EXACTLY THREE (3) PARAGRAPHS, and EACH PARAGRAPH MUST CONTAIN AT LEAST 6 TO 7 FULL, SUBSTANTIAL LINES OF TEXT (minimum 18-21 lines total for the section).
MUST BE 100% MATHEMATICALLY ACCURATE to the 8th/12th house placements, Rahu/Ketu/Saturn karmic influences, running ${dashaLine}, and planetary transits in THIS chart.

DEEP EMOTIONAL RESONANCE MANDATE:
Speak directly to ${input.name}. Highlight the reality of what is happening inside them:
Even though they smile outside, maintain a strong exterior for their family, and appear composed in society, unveil the unspoken emotional struggles, private loneliness, silent sacrifices, and internal vulnerabilities they carry alone and have never disclosed to anyone. When they read this, they must feel profoundly understood: "Yes, this is the nigudha rahasya I have kept locked inside with me, which nobody else sees!"
- Paragraph 1: The hidden mask of fortitude vs inner vulnerability. Emotional burdens, silent fatigue, and secret wounds tied directly to named 8th/12th house placements above.
- Paragraph 2: Rahu-Ketu karmic axis and past-life debt (Rinanubandha). Feeling unappreciated, invisible, or carrying emotional contracts from past lives despite selflessly supporting others.
- Paragraph 3: How this pattern manifests under running ${dashaLine}, and the precise, compassionate spiritual catharsis, inner reconciliation, and transformative blessing from Lord Gokarna Mahabaleshwara (sacred Atma Linga) and Lord Mukhyaprana required to dissolve these silent fears and restore profound peace of mind.
Do not moralise, do not frighten, end on what can be healed and transformed.

${JSON_RULE}
{"darkSecret":[{"impact":"paragraph one (5-6 lines)\\n\\nparagraph two (5-6 lines)\\n\\nparagraph three (5-6 lines)"}]}`;

  const yogas = `${header(
    input,
    "yogas",
    "You are an authoritative Vedic scholar of classical yoga formations explaining planetary blessings with profound depth and personal relevance."
  )}
CRITICAL STRUCTURAL & CONTENT REQUIREMENT:
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
    "You are an empathetic Vedic master who analyzes planetary afflictions (doshas) as solvable karmic opportunities with practical wisdom."
  )}
CRITICAL STRUCTURAL & CONTENT REQUIREMENT:
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
    "You are an authoritative Vedic astrologer evaluating live planetary transits against the native's Janma Chandra Rashi with deep psychological and practical insight."
  )}
CRITICAL STRUCTURAL & CONTENT REQUIREMENT:
Evaluate the real live transits from the chart facts counted from their Janma Chandra Rashi (${rashiName(input.moonRashiIndex, lang)}). Cover Saturn (Shani), Jupiter (Guru), and Rahu-Ketu nodal axis transits.
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

CRITICAL PERSONALIZATION REQUIREMENT:
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
CRITICAL PERSONAL CONNECTION & LIVING REALITY REQUIREMENT:
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

- Paragraph 4 (Compassionate Astrological Guidance & Practical Daily Remedies):
  Provide wise, actionable guidance on the exact mental attitude to cultivate during this phase. Give 2 practical Vedic remedies (daily dawn prayer, lighting a sacred lamp at dusk, specific mantra japa or charity) to pacify planetary friction and invite peace, prosperity, and divine grace.

${JSON_RULE}
{"currentPhase":[{"impact":"paragraph 1\n\nparagraph 2\n\nparagraph 3\n\nparagraph 4"}]}`;

  const lagnaIdx = input.lagnaRashiIndex !== null ? input.lagnaRashiIndex : 0;

  const RASHI_LORD_GRAHAS: GrahaKey[] = [
    "Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury",
    "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"
  ];

  const getHouseInfo = (houseNum: number) => {
    const signIdx = (lagnaIdx + houseNum - 1) % 12;
    const sign = rashiName(signIdx, lang);
    const lord = RASHI_LORD_GRAHAS[signIdx];
    const lordStr = grahaName(lord, lang);
    const lordPlacement = input.natalPlanets.find(p => p.graha === lord);
    const occupants = input.natalPlanets.filter(p => p.house === houseNum).map(p => grahaName(p.graha, lang));
    const lordFlags: string[] = [];
    if (lordPlacement?.exalted) lordFlags.push("exalted");
    if (lordPlacement?.debilitated) lordFlags.push("debilitated");
    if (lordPlacement?.retrograde) lordFlags.push("retrograde");
    const lordDignity = lordFlags.length ? ` (${lordFlags.join(", ")})` : "";
    const lordWhere = lordPlacement ? `in Bhava ${lordPlacement.house} (${rashiName(lordPlacement.rashiIndex, lang)})${lordDignity}` : "unplaced";
    const occStr = occupants.length ? occupants.join(", ") : "no planets occupying";
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

  const isChild = input.ageYears < 8;
  const isChildNative = input.ageYears < 14;

  // Strict Parashari Dosha detection per life category
  const h7Occupants = input.natalPlanets.filter(p => p.house === 7);
  const h8Occupants = input.natalPlanets.filter(p => p.house === 8);
  const hasMarriageDosha = !!(
    (isManglik && !input.isManglikCancelled) ||
    h7Occupants.some(p => ["Rahu", "Ketu", "Saturn", "Mars"].includes(p.graha)) ||
    h8Occupants.some(p => ["Rahu", "Ketu", "Saturn", "Mars"].includes(p.graha)) ||
    input.natalPlanets.find(p => p.graha === h7.lord)?.debilitated ||
    (!input.isManglikCancelled && input.engineDoshas.some(d => /kuja|manglik|kalatra|vivaha|7th|8th/i.test(d.name)))
  );

  const h5Occupants = input.natalPlanets.filter(p => p.house === 5);
  const hasSantanaDosha = !!(
    h5Occupants.some(p => ["Rahu", "Ketu", "Saturn", "Mars"].includes(p.graha)) ||
    input.natalPlanets.find(p => p.graha === h5.lord)?.debilitated ||
    jupiterPlacement?.debilitated ||
    input.engineDoshas.some(d => /santana|putra|naga|sarpa|pitru|5th/i.test(d.name))
  );

  const hasBalyaDosha = isChildNative && !!(
    (moonPlacement && [6, 8, 12].includes(moonPlacement.house)) ||
    input.natalPlanets.find(p => p.graha === h1.lord)?.debilitated ||
    input.engineDoshas.some(d => /balarishta|balya|gandanta|arogya|pediatric/i.test(d.name))
  );

  const h10Occupants = input.natalPlanets.filter(p => p.house === 10);
  const hasCareerDosha = !!(
    h10Occupants.some(p => ["Rahu", "Ketu"].includes(p.graha)) ||
    input.natalPlanets.find(p => p.graha === h10.lord)?.debilitated ||
    saturnPlacement?.debilitated ||
    input.engineDoshas.some(d => /karma|shrapit|amavasya|grahan|10th/i.test(d.name))
  );

  const h2Occupants = input.natalPlanets.filter(p => p.house === 2);
  const h11Occupants = input.natalPlanets.filter(p => p.house === 11);
  const hasWealthDosha = !!(
    h2Occupants.some(p => ["Rahu", "Ketu"].includes(p.graha)) ||
    h11Occupants.some(p => ["Rahu", "Ketu"].includes(p.graha)) ||
    input.natalPlanets.find(p => p.graha === h2.lord)?.debilitated ||
    input.engineDoshas.some(d => /dhana|daridra|kemadruma|2nd|11th/i.test(d.name))
  );

  const h6Occupants = input.natalPlanets.filter(p => p.house === 6);
  const hasHealthDosha = !!(
    h6Occupants.some(p => ["Saturn", "Rahu", "Mars"].includes(p.graha)) ||
    input.natalPlanets.find(p => p.graha === h6.lord)?.debilitated ||
    input.natalPlanets.find(p => p.graha === h1.lord)?.debilitated ||
    input.engineDoshas.some(d => /roga|maraka|mrityu|balarishta|health|arogya/i.test(d.name))
  );

  const bhavishya = isChild ? `${header(
    input,
    "bhavishya",
    "You are a wise and compassionate Vedic astrologer specializing in child horoscopes, analyzing early intellectual development, education, activities, creative talents, health, and parental nurturing."
  )}
CRITICAL CHILD HOROSCOPE ACCURACY REQUIREMENT:
The native is a young child (${Math.floor(input.ageYears)} years old). DO NOT generate any adult marriage, romantic, or progeny predictions.
Instead, write deep astrological guidance for the child's development across these key areas.
For each category, write STRICTLY THREE (3) expansive paragraphs, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (approx. 75-100 words / 350-500 characters per paragraph). Speak directly to 'you' or to the parents about the child.

1. Education & Early Intellect (Vidya & Buddhi):
   - 4th House (Vidya): ${getHouseInfo(4).sign} (Lord ${getHouseInfo(4).lordStr} ${getHouseInfo(4).lordWhere}). 5th House (Buddhi): ${h5.sign} (Lord ${h5.lordStr} ${h5.lordWhere}).
   - Mercury (Budha): ${input.natalPlanets.find(p => p.graha === "Mercury") ? `in Bhava ${input.natalPlanets.find(p => p.graha === "Mercury")!.house}` : "present"}. Jupiter (Guru): ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house}` : "present"}.
   - Paragraph 1: Memory power, grasping capacity, academic inclination, and intellectual focus.
   - Paragraph 2: Optimal learning environment, curiosity development, and parental guidance.
   - Paragraph 3: DEDICATED INTELLECTUAL GUIDANCE starting with 【...】 (e.g. 【ಸರಸ್ವತಿ ಕೃಪೆ & ವಿದ್ಯಾಭ್ಯಾಸ ಮಾರ್ಗದರ್ಶನ】 / 【Saraswati Grace & Learning Guidance】): Detail Saraswati & Ganesha prayers, morning Gayatri chanting, and keeping study sanctuary clean for sharpened intellect.

2. Talents, Activities & Sports (Kala, Kreeda & Kaushalya):
   - 3rd House (Parakrama): ${getHouseInfo(3).sign}. 5th House: ${h5.sign}. Mars: ${marsPlacement ? `in Bhava ${marsPlacement.house}` : "present"}. Venus: ${venusPlacement ? `in Bhava ${venusPlacement.house}` : "present"}.
   - Paragraph 1: Physical energy, sports inclination, and active stamina.
   - Paragraph 2: Extracurricular inclinations, artistic expression, music, and creative hobbies.
   - Paragraph 3: DEDICATED TALENTS GUIDANCE starting with 【...】 (e.g. 【ಪ್ರತಿಭಾ ವಿಕಾಸ & ಕೌಶಲ್ಯ ಮಾರ್ಗದರ್ಶನ】 / 【Talents & Creative Expansion Guidance】): Constructive channeling of youthful exuberance, group sports, and cultural arts.

3. Future Foundation & Character:
   - Paragraph 1: Moral compass, integrity, leadership qualities, and truthfulness.
   - Paragraph 2: Disciplined habit formation, respectful demeanor towards elders, and emotional resilience.
   - Paragraph 3: DEDICATED CHARACTER GUIDANCE starting with 【...】 (e.g. 【ಸಂಸ್ಕಾರ & ವ್ಯಕ್ತಿತ್ವ ನಿರ್ಮಾಣ】 / 【Character Foundation & Sacred Samskaras】): Instilling ethical values, patience, and noble life orientation.

4. Family Environment & Upbringing:
   - Paragraph 1: Family warmth, emotional security, and protective home atmosphere.
   - Paragraph 2: Parental nurturing style, communication, and mutual affection.
   - Paragraph 3: DEDICATED DOMESTIC GUIDANCE starting with 【...】 (e.g. 【ಕೌಟುಂಬಿಕ ಪ್ರೀತಿ & ದೈವಿಕ ರಕ್ಷಣೆ】 / 【Family Sanctuary & Auspicious Harmony】): Preserving peaceful family rhythms, regular household prayers, and divine household harmony.

5. Health, Vitality & Pediatric Care (Bala Arogya):
   - 1st House (Lagna): ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}). 6th House: ${h6.sign}.
   ${hasBalyaDosha
     ? `Write EXACTLY THREE detailed paragraphs (Balarishta/Balya Dosha indicated in chart):
        Paragraph 1: Physical constitution, seasonal pediatric care, and stamina.
        Paragraph 2: Mental equanimity and parental reassurance.
        Paragraph 3: DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ಬಾಲ್ಯ ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಆಯುಷ್ಯ ರಕ್ಷಾ ಶಾಂತಿ】 / 【Balya Dosha Analysis & Pediatric Health Shanti】): Analyze the subtle Moon/Lagna planetary affliction, and give specific Vedic remedies (Mrityunjaya japa, Dhanvantari prayer, and Gokarna archana).`
     : `Write EXACTLY THREE detailed paragraphs:
        Paragraph 1: Pediatric vitality, natural immunity, and seasonal care.
        Paragraph 2: Daily nutritious routine, active vitality, and physical wellness.
        Paragraph 3: DEDICATED VITALITY GUIDANCE starting with 【...】 (e.g. 【ಆರೋಗ್ಯ ರಕ್ಷಣೆ & ಧನ್ವಂತರಿ ಕೃಪೆ】 / 【Pediatric Vitality & Divine Protection】): Morning sunlight, pure hydration, wholesome sattvic nourishment, and Dhanvantari prayer for robust childhood vigor.`
   }

${JSON_RULE}
{"bhavishya":{"marriage":"three paragraphs of 5-6 lines each","children":"three paragraphs of 5-6 lines each","career":"three paragraphs of 5-6 lines each","wealth":"three paragraphs of 5-6 lines each","health":"three paragraphs of 5-6 lines each"}}`
  : `${header(
    input,
    "bhavishya",
    "You are an authoritative Vedic astrologer analyzing specific life areas based strictly on 7th house lord, 5th house lord, 10th house lord, and 2nd house lord."
  )}
CRITICAL PERSONALIZED ACCURACY REQUIREMENT:
Provide a 100% personalized astrological reading for the following 5 life categories based on this chart's exact computed placements:
- Native Age: ${Math.floor(input.ageYears)} years old, Gender: ${(input.gender || "Male").toUpperCase()}.
${input.ageYears >= 60 ? "- SENIOR CITIZEN (60+ YEARS): The native is a senior. Tailor all interpretations with deep emotional reverence for their life stage. Focus on lifelong spiritual companionship, domestic serenity, mutual health care, family legacy, joy from grandchildren, mentorship, and asset preservation. NEVER suggest wedding proposals, matchmaking, or seeking marriage alliances." : input.ageYears < 22 ? "- YOUTH / STUDENT (< 22 YEARS): The native is in their student/youth phase. Focus on higher education, college admissions, competitive exams, study discipline, character formation, avoiding premature distractions, and building professional foundations. NEVER suggest marriage timing or finding romantic partners." : "- ADULT (22-59 YEARS): Deliver deeply resonant, mature astrological readings strictly grounded in chart facts, career ascent, and family prosperity."}
For EACH category, write STRICTLY THREE (3) expansive paragraphs, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (approx. 75-100 words / 350-500 characters per paragraph). Speak directly to 'you'.

1. Marriage & Relationships (User Selected Status: ${maritalSel.toUpperCase()}):
   - 7th House Sign: ${h7.sign}. 7th House Lord: ${h7.lordStr} is placed ${h7.lordWhere}.
   - Occupants of 7th House: ${h7.occStr}.
   - Native Gender: ${(input.gender || "Male").toUpperCase()}.
   - Karaka Placement: ${(input.gender || "Male") === "Female" ? `Jupiter (Jeevakaraka) is placed ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house} (${rashiName(jupiterPlacement.rashiIndex, lang)})` : "in chart"}, 8th House (Mangalya Sthana) is ${h8.sign} with lord ${h8.lordStr}` : `Venus (Shukrakaraka) is placed ${venusPlacement ? `in Bhava ${venusPlacement.house} (${rashiName(venusPlacement.rashiIndex, lang)})` : "in chart"}`}.
   - Kuja / Manglik Status: ${input.isManglikCancelled ? `Kuja Dosha CANCELLED / NEUTRALIZED via Parashari Apavada (${input.manglikCancellationReason}). Do not prescribe remedies for delay.` : isManglik ? `Kuja Dosha indicated (Mars in Bhava ${marsPlacement?.house})` : "No Kuja Dosha (Mars is comfortably placed outside 1/2/4/7/8/12)"}.
   - Direction of Spouse Alignment: ${spouseDirection} direction from birthplace.
   - Vivaha Yoga & Transits: Running ${dashaLine}. Jupiter transit: ${guruTransit ? `${guruTransit.houseFromMoon} from Chandra (${isGuruBala ? "Guru Bala active" : "Guru testing"})` : "active"}. Saturn transit: ${shaniTransit ? `${shaniTransit.houseFromMoon} from Chandra` : "active"}.
   - CRITICAL RULE: MUST CONTAIN ONLY MARRIAGE & RELATIONSHIP CONTENT. DO NOT INCLUDE ANY CHILDREN OR PROGENY CONTENT IN THIS ITEM. IF USER SELECTED 'no_children', DO NOT MENTION RAISING CHILDREN, SCHOOLING, OR PARENTING. Focus purely on the deep emotional bond between the couple, mutual trust, and facing external questions as a united front.
   ${hasMarriageDosha
     ? `CRITICAL DOSHA DETECTED: Write EXACTLY THREE detailed paragraphs for ${maritalSel.toUpperCase()} status:
        Paragraph 1: Grounded in 7th lord ${h7.lordStr} ${h7.lordWhere}, running ${dashaLine}, and transit influences. Analyze how these planets govern mutual trust, domestic stability, and emotional depth.
        Paragraph 2: Detailed psychological and practical dynamics of partnership—mutual respect in financial and household decisions, spouse's temperament reflecting ${h7.lordStr} and 7th house qualities, and shared milestones.${childrenSel === 'no_children' ? ' Focus on mutual emotional sanctuary, standing as anchors for each other, and facing societal questions together.' : ''}
        Paragraph 3: DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ವಿವಾಹ ಶಾಂತಿ】 / 【Dosha Analysis & Relationship Shanti】): Analyze the detected ${isManglik ? "Kuja/Manglik Dosha" : "7th/8th house planetary affliction"} in this chart. ${maritalSel === "married" ? "Since the native is ALREADY MARRIED, strictly focus on domestic harmony, resolving occasional ego friction, and mutual communication—never 'delay in marriage'." : "Discuss alliance selection, avoiding hasty decisions, and favorable timing."} Prescribe specific Vedic remedies (${isManglik ? "Subramanya / Mangala Pooja at Sri Kshetra Gokarna Mahabaleshwara" : "Lakshmi-Narayana / Gauri-Shankara Pooja"}).`
     : `NO DOSHA PRESENT: Write EXACTLY THREE detailed paragraphs for ${maritalSel.toUpperCase()} status:
        Paragraph 1: Grounded in 7th lord ${h7.lordStr} ${h7.lordWhere}, running ${dashaLine}, and transit influences. Analyze how these planets govern mutual trust, domestic stability, and emotional depth.
        Paragraph 2: Detailed psychological and practical dynamics of partnership—mutual respect in financial and household decisions, spouse's temperament reflecting ${h7.lordStr} and 7th house qualities, and harmonious companionship.
        Paragraph 3: DEDICATED PLANETARY STRENGTHS & MARITAL HARMONY starting with 【...】 (e.g. 【ದಾಂಪತ್ಯ ಸೌಖ್ಯ & ದೈವಿಕ ಮಾರ್ಗದರ್ಶನ】 / 【Marital Harmony & Auspicious Guidance】): Highlight benefic planetary aspects, auspicious transit timing, deep mutual trust, spiritual synergy between partners, and prescribe weekly Lakshmi-Narayana archana and cow ghee lamp offering for lasting domestic happiness.`
   }

2. Children & Progeny (User Selected Status: ${childrenSel.toUpperCase()}):
   - 5th House Sign: ${h5.sign}. 5th House Lord: ${h5.lordStr} is placed ${h5.lordWhere}.
   - Occupants of 5th House: ${h5.occStr}.
   - Putrakaraka Jupiter (Guru): placed ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house} (${rashiName(jupiterPlacement.rashiIndex, lang)})` : "in chart"}.
   - Progeny Transit: Jupiter transit ${guruTransit?.houseFromMoon} from Chandra. Running ${dashaLine}.
   ${hasSantanaDosha
     ? `CRITICAL DOSHA DETECTED (Santana/5th House Affliction): Write STRICTLY THREE (3) expansive paragraphs for ${childrenSel === "has_children" ? "HAS CHILDREN" : childrenSel === "no_children" ? "NO CHILDREN" : "GENERAL"} status (Paragraphs 1 and 2 of in-depth analysis, followed by Paragraph 3 of dedicated dosha analysis):
        Paragraph 1: Detailed analysis of 5th house ${h5.sign}, 5th lord ${h5.lordStr} ${h5.lordWhere}, and Putrakaraka Jupiter.${childrenSel === 'no_children' ? ' Deep emotional validation of the quiet, unspoken longing and heartfelt prayers for a child, emphasizing that lineage continuity is preserved in Poorva Punya.' : ' Analysis of children\'s intellect, academic focus, and moral character.'}
        Paragraph 2: Astrological timing, transit support, and parental/household guidance.${childrenSel === 'no_children' ? ' Reassure them with warmth that delays are periods of karmic refinement, not denial; encourage standing united.' : ' Children\'s future growth, specialized talents, and spiritual harmony.'}
        Paragraph 3: DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಸಂತಾನ ಶಾಂತಿ】 / 【Dosha Analysis & Progeny Shanti】): Analyze the detected 5th house affliction (Naga/Sarpa Dosha, Rahu-Ketu axis, or Saturn influence) and prescribe sacred Vedic remedies: Daily Santana Gopala Mantra, Thursday Gau-seva, and Subrahmanya / Naga Shanti Pooja at Sri Kshetra Gokarna Mahabaleshwara.`
     : `NO DOSHA PRESENT: Write STRICTLY THREE (3) expansive paragraphs for ${childrenSel === "has_children" ? "HAS CHILDREN" : childrenSel === "no_children" ? "NO CHILDREN" : "GENERAL"} status (Paragraphs 1 and 2 of in-depth analysis, followed by Paragraph 3 of dedicated progeny blessings & sacred guidance):
        Paragraph 1: Detailed analysis of 5th house ${h5.sign}, 5th lord ${h5.lordStr} ${h5.lordWhere}, and Putrakaraka Jupiter.${childrenSel === 'no_children' ? ' Warm emotional validation of their family aspirations and fertile astrological windows.' : ' Analysis of children\'s intellect, moral values, and family bonding.'}
        Paragraph 2: Educational support, intellectual legacy, and divine family blessings.
        Paragraph 3: DEDICATED PROGENY BLESSINGS & SACRED GUIDANCE starting with 【...】 (e.g. 【ಸಂತಾನ ಭಾಗ್ಯ & ಶುಭ ಮಾರ್ಗದರ್ಶನ】 / 【Progeny Blessings & Sacred Guidance】): ${childrenSel === 'no_children' ? 'Reaffirm auspicious upcoming planetary windows for conception. Prescribe daily joint recitation of the sacred Santana Gopala Mantra, Thursday Gau-seva (feeding cows jaggery/grass), and seeking blessings at Sri Kshetra Gokarna Mahabaleshwara for healthy progeny.' : 'Highlight the children\'s positive intellectual and karmic trajectory, encouraging parental dharma, family prayers, and noble heritage.'}`
   }

3. Career & Profession:
   - 10th House Sign: ${h10.sign}. 10th House Lord: ${h10.lordStr} is placed ${h10.lordWhere}.
   - Occupants of 10th House: ${h10.occStr}.
   - Karmakaraka Saturn (Shani): placed ${saturnPlacement ? `in Bhava ${saturnPlacement.house} (${rashiName(saturnPlacement.rashiIndex, lang)})` : "in chart"}.
   ${hasCareerDosha
     ? `CRITICAL DOSHA DETECTED: Write EXACTLY THREE (3) expansive paragraphs:
        Paragraph 1: Professional aptitude, career stability, leadership prospects, and timing under running ${dashaLine}.
        Paragraph 2: Strategic workplace navigation, promotions, skill growth, and public reputation.
        Paragraph 3: DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಕರ್ಮ ಶಾಂತಿ】 / 【Dosha Analysis & Career Remedy】): Analyze the detected 10th house / Karma / Saturn affliction, explain obstacle mechanisms, and detail Shani Shanti pooja, Dasharatha Stotram, and Rudrabhishekam at Sri Kshetra Gokarna Mahabaleshwara.`
     : `NO DOSHA PRESENT: Write EXACTLY THREE (3) expansive paragraphs:
        Paragraph 1: Professional aptitude, career stability, leadership prospects, and timing under running ${dashaLine}.
        Paragraph 2: Strategic workplace navigation, promotions, skill growth, and vocational ascent.
        Paragraph 3: DEDICATED CAREER ASCENT & LEADERSHIP GUIDANCE starting with 【...】 (e.g. 【ವೃತ್ತಿ ಪ್ರಗತಿ & ಯಶಸ್ಸಿನ ಮಾರ್ಗದರ್ಶನ】 / 【Career Ascent & Leadership Guidance】): Emphasize natural vocational leadership, optimal timing for career milestones under running dasha, team collaboration, and Rudrabhishekam / Aditya Hridaya prayer for continuous career distinction.`
   }

4. Wealth & Family Finance:
   - 2nd House (Accumulated Wealth): ${h2.sign} (Lord ${h2.lordStr} ${h2.lordWhere}, occupants: ${h2.occStr}).
   - 11th House (Income & Gains): ${h11.sign} (Lord ${h11.lordStr} ${h11.lordWhere}, occupants: ${h11.occStr}).
   - Dhanakaraka Jupiter: ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house}` : "present"}.
   ${hasWealthDosha
     ? `CRITICAL DOSHA DETECTED: Write EXACTLY THREE (3) expansive paragraphs:
        Paragraph 1: Financial accumulation, income stability, investments, property gains, and family prosperity.
        Paragraph 2: Debt management, liquidity planning, wealth preservation, and ancestral assets.
        Paragraph 3: DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಧನ ಸಮೃದ್ಧಿ ಶಾಂತಿ】 / 【Dosha Analysis & Financial Shanti】): Analyze the detected financial affliction, obstacle resolution, and prescribe Lakshmi Kubera Aradhana and cow ghee lamp remedy.`
     : `NO DOSHA PRESENT: Write EXACTLY THREE (3) expansive paragraphs:
        Paragraph 1: Financial accumulation, income stability, investments, property gains, and family prosperity.
        Paragraph 2: Debt management, liquidity planning, wealth preservation, and ancestral asset growth.
        Paragraph 3: DEDICATED WEALTH PROSPERITY & DHANAKARAKA BLESSING starting with 【...】 (e.g. 【ಧನ ಸಮೃದ್ಧಿ & ಆರ್ಥಿಕ ಯೋಗ】 / 【Wealth Prosperity & Investment Guidance】): Emphasize strong wealth accumulation yogas, strategic investment preservation, family prosperity, and prescribe weekly Lakshmi Kubera prayers and offering pure cow ghee lamps for financial auspiciousness.`
   }

5. Health & Vitality:
   - 1st House (Lagna / Physical Constitution): ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}).
   - 6th House (Roga Sthana): ${h6.sign} (Lord ${h6.lordStr} ${h6.lordWhere}).
   - Sun (Vitality) and Moon (Mental Equanimity) dignity in chart.
   ${hasHealthDosha
     ? `CRITICAL DOSHA DETECTED: Write EXACTLY THREE (3) expansive paragraphs:
        Paragraph 1: Physical constitution, vital energy, seasonal wellness precautions, and metabolic stamina.
        Paragraph 2: Emotional resilience, mental peace, stress mitigation, and Ayurvedic daily routines.
        Paragraph 3: DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಆರೋಗ್ಯ ರಕ್ಷಾ ಶಾಂತಿ】 / 【Dosha Analysis & Health Shield Shanti】): Analyze the detected 6th/8th house roga affliction, and prescribe Mahamrityunjaya japa, Dhanvantari prayer, and Gokarna Mrityunjaya homa.`
     : `NO DOSHA PRESENT: Write EXACTLY THREE (3) expansive paragraphs:
        Paragraph 1: Physical constitution, vital energy, seasonal wellness precautions, and metabolic stamina.
        Paragraph 2: Emotional resilience, mental peace, stress mitigation, and Ayurvedic daily routines.
        Paragraph 3: DEDICATED VITALITY & LONGEVITY SHIELD starting with 【...】 (e.g. 【ಆರೋಗ್ಯ ಸಂರಕ್ಷಣೆ & ದೀರ್ಘಾಯುಷ್ಯ ಮಾರ್ಗದರ್ಶನ】 / 【Vitality Preservation & Wellness Guidance】): Prescribe healthy morning Surya Namaskar, Ayurvedic seasonal balance, daily Prana cultivation, and Dhanvantari prayer for robust lifelong immunity and vitality.`
   }

${JSON_RULE}
{"bhavishya":{"marriage":"three paragraphs","children":"three paragraphs","career":"three paragraphs","wealth":"three paragraphs","health":"three paragraphs"}}`;

  const bhavishyaMarriageChildren = `${header(
    input,
    "bhavishyaMarriageChildren",
    "You are a revered Vedic master astrologer providing an in-depth, authentic reading on Marriage/Partnership and Children/Progeny for " + input.name + "."
  )}
CRITICAL MANDATE:
Write exhaustive, deeply personalized analysis strictly based on ${input.name}'s Janma Kundali.
For each category, write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (approx. 75-100 words / 350-500 characters per paragraph). Speak directly to 'you'. Do not write short or generic text.

1. Marriage & Partnerships (User Selected Status: ${maritalSel.toUpperCase()}):
   - 7th House Sign: ${h7.sign}. 7th House Lord: ${h7.lordStr} is placed ${h7.lordWhere}.
   - Occupants of 7th House: ${h7.occStr}.
   - Vivahakaraka: ${input.gender === "Female" ? `Guru (Jupiter) placed ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house}` : "in chart"}` : `Shukra (Venus) placed ${venusPlacement ? `in Bhava ${venusPlacement.house}` : "in chart"}`}.
   - Kuja/Manglik: ${input.isManglikCancelled ? `Kuja Dosha CANCELLED / NEUTRALIZED via Parashari Apavada (${input.manglikCancellationReason}). Do not prescribe remedies for delay.` : isManglik ? `Yes, Mars in Bhava ${marsPlacement?.house} causing Kuja Dosha` : "No Kuja Dosha"}.
   - Direction of Partner: ${spouseDirection}.
   - Running ${dashaLine}.
   ${hasMarriageDosha
     ? `CRITICAL DOSHA DETECTED: Write EXACTLY THREE detailed paragraphs:
        Paragraph 1: Grounded in 7th lord ${h7.lordStr} ${h7.lordWhere}, running ${dashaLine}, and transit influences. Analyze how these planets govern mutual trust, domestic stability, and emotional depth.
        Paragraph 2: Detailed psychological and practical dynamics of partnership—mutual respect in financial and household decisions, spouse's temperament reflecting ${h7.lordStr} and 7th house qualities, and shared milestones.${childrenSel === 'no_children' ? ' Focus on mutual emotional sanctuary, standing as anchors for each other, and facing societal questions together.' : ''}
        Paragraph 3: DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ವಿವಾಹ ಶಾಂತಿ】 / 【Dosha Analysis & Relationship Shanti】): Analyze the detected ${isManglik ? "Kuja/Manglik Dosha" : "7th/8th house affliction"} in this chart. ${maritalSel === "married" ? "Since the native is ALREADY MARRIED, strictly focus on domestic harmony, resolving occasional ego friction, and mutual communication—never 'delay in marriage'." : "Discuss alliance selection, avoiding hasty decisions, and favorable timing."} Prescribe specific Vedic remedies (${isManglik ? "Subramanya / Mangala Pooja at Sri Kshetra Gokarna Mahabaleshwara" : "Lakshmi-Narayana / Gauri-Shankara Pooja"}).`
     : `NO DOSHA PRESENT: Write EXACTLY THREE detailed paragraphs:
        Paragraph 1: Grounded in 7th lord ${h7.lordStr} ${h7.lordWhere}, running ${dashaLine}, and transit influences. Analyze how these planets govern mutual trust, domestic stability, and emotional depth.
        Paragraph 2: Detailed psychological and practical dynamics of partnership—mutual respect in financial and household decisions, spouse's temperament reflecting ${h7.lordStr} and 7th house qualities, and domestic harmony.
        Paragraph 3: DEDICATED PLANETARY STRENGTHS & MARITAL HARMONY starting with 【...】 (e.g. 【ದಾಂಪತ್ಯ ಸೌಖ್ಯ & ದೈವಿಕ ಮಾರ್ಗದರ್ಶನ】 / 【Marital Harmony & Auspicious Guidance】): Benefic aspects, mutual trust, and Lakshmi-Narayana prayers.`
   }

2. Children & Progeny (User Selected Status: ${childrenSel.toUpperCase()}):
   - 5th House Sign: ${h5.sign}. 5th House Lord: ${h5.lordStr} is placed ${h5.lordWhere}.
   - Occupants of 5th House: ${h5.occStr}.
   - Putrakaraka Jupiter (Guru): placed ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house} (${rashiName(jupiterPlacement.rashiIndex, lang)})` : "in chart"}.
   - Progeny Transit: Jupiter transit ${guruTransit?.houseFromMoon} from Chandra. Running ${dashaLine}.
   ${hasSantanaDosha
     ? `CRITICAL DOSHA DETECTED (Santana/5th House Affliction): Write EXACTLY THREE detailed paragraphs:
        Paragraph 1: Detailed analysis of 5th house ${h5.sign}, 5th lord ${h5.lordStr} ${h5.lordWhere}, and Putrakaraka Jupiter.${childrenSel === 'no_children' ? ' Deep emotional validation of the quiet, unspoken longing and heartfelt prayers for a child, emphasizing that lineage continuity is preserved in Poorva Punya.' : ' Analysis of children\'s intellect, academic focus, and moral character.'}
        Paragraph 2: Astrological timing, transit support, and parental/household guidance.${childrenSel === 'no_children' ? ' Reassure them with warmth that delays are periods of karmic refinement, not denial; encourage standing united.' : ' Children\'s future growth, specialized talents, and spiritual harmony.'}
        Paragraph 3: DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಸಂತಾನ ಶಾಂತಿ】 / 【Dosha Analysis & Progeny Shanti】): Analyze the detected 5th house affliction (Naga/Sarpa Dosha, Rahu-Ketu axis, or Saturn influence) and prescribe sacred Vedic remedies: Daily Santana Gopala Mantra, Thursday Gau-seva, and Subrahmanya / Naga Shanti Pooja at Sri Kshetra Gokarna Mahabaleshwara.`
     : `NO DOSHA PRESENT: Write EXACTLY THREE detailed paragraphs:
        Paragraph 1: Detailed analysis of 5th house ${h5.sign}, 5th lord ${h5.lordStr} ${h5.lordWhere}, and Putrakaraka Jupiter.${childrenSel === 'no_children' ? ' Warm emotional validation of their family aspirations and fertile astrological windows.' : ' Analysis of children\'s intellect, moral values, and family bonding.'}
        Paragraph 2: Educational support, intellectual legacy, and divine family blessings.
        Paragraph 3: DEDICATED PROGENY BLESSINGS & SACRED GUIDANCE starting with 【...】 (e.g. 【ಸಂತಾನ ಭಾಗ್ಯ & ಶುಭ ಮಾರ್ಗದರ್ಶನ】 / 【Progeny Blessings & Sacred Guidance】): ${childrenSel === 'no_children' ? 'Upcoming auspicious windows, Santana Gopala mantra, Gau-seva and Sri Kshetra Gokarna blessings.' : 'Children\'s future growth, spiritual harmony, and noble family heritage.'}`
   }

${JSON_RULE}
{"bhavishya":{"marriage":"three paragraphs of 5-6 lines each","children":"three paragraphs of 5-6 lines each"}}`;

  const bhavishyaCareerWealthHealth = `${header(
    input,
    "bhavishyaCareerWealthHealth",
    "You are a revered Vedic master astrologer providing an in-depth, authentic reading on Career, Wealth, and Health for " + input.name + "."
  )}
CRITICAL MANDATE:
Write exhaustive, deeply personalized analysis strictly based on ${input.name}'s Janma Kundali.
For each category, write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (approx. 75-100 words / 350-500 characters per paragraph). Speak directly to 'you'. Do not write short or generic text.

1. Career & Profession:
   - 10th House Sign: ${h10.sign}. 10th House Lord: ${h10.lordStr} is placed ${h10.lordWhere}.
   - Occupants of 10th House: ${h10.occStr}.
   - Karmakaraka Saturn (Shani): placed ${saturnPlacement ? `in Bhava ${saturnPlacement.house} (${rashiName(saturnPlacement.rashiIndex, lang)})` : "in chart"}.
   - Paragraph 1: Professional stability, leadership prospects, vocational aptitude, and timing under running ${dashaLine}.
   - Paragraph 2: Strategic workplace navigation, career growth, transitions, and public reputation.
   ${hasCareerDosha
     ? `- Paragraph 3: DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಕರ್ಮ ಶಾಂತಿ】 / 【Dosha Analysis & Career Remedy】): Analyze the detected 10th house / Karma dosha, explain obstacle mechanisms, and detail Shani Shanti pooja, Dasharatha Stotram, and Rudrabhishekam at Sri Kshetra Gokarna Mahabaleshwara.`
     : `- Paragraph 3: DEDICATED CAREER ASCENT & LEADERSHIP GUIDANCE starting with 【...】 (e.g. 【ವೃತ್ತಿ ಪ್ರಗತಿ & ಯಶಸ್ಸಿನ ಮಾರ್ಗದರ್ಶನ】 / 【Career Ascent & Leadership Guidance】): Natural vocational leadership, optimal timing for career milestones under running dasha, team collaboration, and Rudrabhishekam / Aditya Hridaya prayer for continuous career distinction.`
   }

2. Wealth & Family Finance:
   - 2nd House (Accumulated Wealth): ${h2.sign} (Lord ${h2.lordStr} ${h2.lordWhere}, occupants: ${h2.occStr}).
   - 11th House (Income & Gains): ${h11.sign} (Lord ${h11.lordStr} ${h11.lordWhere}, occupants: ${h11.occStr}).
   - Dhanakaraka Jupiter: ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house}` : "present"}.
   - Paragraph 1: Financial accumulation, investments, property gains, and income growth under running ${dashaLine}.
   - Paragraph 2: Liquidity planning, family prosperity, asset consolidation, and wealth preservation.
   ${hasWealthDosha
     ? `- Paragraph 3: DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಧನ ಸಮೃದ್ಧಿ ಶಾಂತಿ】 / 【Dosha Analysis & Financial Shanti】): Analyze the detected financial affliction, obstacle resolution, and prescribe Lakshmi Kubera Aradhana and cow ghee lamp remedy.`
     : `- Paragraph 3: DEDICATED WEALTH PROSPERITY & DHANAKARAKA BLESSING starting with 【...】 (e.g. 【ಧನ ಸಮೃದ್ಧಿ & ಆರ್ಥಿಕ ಯೋಗ】 / 【Wealth Prosperity & Investment Guidance】): Strong wealth accumulation yogas, strategic investment preservation, family prosperity, and prescribe weekly Lakshmi Kubera prayers and offering pure cow ghee lamps for financial auspiciousness.`
   }

3. Health & Vitality:
   - 1st House (Lagna / Physical Constitution): ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}).
   - 6th House (Roga Sthana): ${h6.sign} (Lord ${h6.lordStr} ${h6.lordWhere}).
   - Sun (Vitality) and Moon (Mental Equanimity) dignity in chart.
   - Paragraph 1: Physical constitution, vitality, seasonal wellness precautions, and metabolic stamina.
   - Paragraph 2: Mental equanimity, stress management, sleep quality, and daily Ayurvedic lifestyle.
   ${hasHealthDosha
     ? `- Paragraph 3: DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಆರೋಗ್ಯ ರಕ್ಷಾ ಶಾಂತಿ】 / 【Dosha Analysis & Health Shield Shanti】): Analyze the detected 6th/8th house roga affliction, and prescribe Mahamrityunjaya japa, Dhanvantari prayer, and Gokarna Mrityunjaya homa.`
     : `- Paragraph 3: DEDICATED VITALITY & LONGEVITY SHIELD starting with 【...】 (e.g. 【ಆರೋಗ್ಯ ಸಂರಕ್ಷಣೆ & ದೀರ್ಘಾಯುಷ್ಯ ಮಾರ್ಗದರ್ಶನ】 / 【Vitality Preservation & Wellness Guidance】): Healthy morning Surya Namaskar, Ayurvedic seasonal balance, daily Prana cultivation, and Dhanvantari prayer for robust lifelong immunity and vitality.`
   }

${JSON_RULE}
{"bhavishya":{"career":"three paragraphs of 5-6 lines each","wealth":"three paragraphs of 5-6 lines each","health":"three paragraphs of 5-6 lines each"}}`;

  // Individual Granular Life Domain Prompts (100% Isolated Gemini Calls)
  const isSenior = input.ageYears >= 60;
  const isYouth = input.ageYears < 22;

  const bhavishyaMarriage = isChild ? `${header(
    input,
    "bhavishyaChildEducation",
    "You are a revered Vedic master astrologer analyzing Education, Intellect, Memory Power, and Academic Aptitude for child " + input.name + "."
  )}
CRITICAL CHILD HOROSCOPE MANDATE:
The native is a young child (${Math.floor(input.ageYears)} years old). Focus strictly on early education, memory power, cognitive grasping capacity, and parental guidance. DO NOT mention marriage or romance.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (approx. 75-100 words / 350-500 characters per paragraph).
4th House (Vidya): ${getHouseInfo(4).sign} (Lord ${getHouseInfo(4).lordStr} ${getHouseInfo(4).lordWhere}). 5th House (Buddhi): ${h5.sign} (Lord ${h5.lordStr} ${h5.lordWhere}).
Mercury (Budha): ${input.natalPlanets.find(p => p.graha === "Mercury") ? `in Bhava ${input.natalPlanets.find(p => p.graha === "Mercury")!.house}` : "present"}. Jupiter (Guru): ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house}` : "present"}.
Paragraph 1: Memory power, cognitive retention, learning grasping speed, and natural scholastic aptitude.
Paragraph 2: Supportive study atmosphere at home, curiosity cultivation, and constructive parental guidance.
Paragraph 3: DEDICATED SCHOLASTIC GUIDANCE starting with 【...】 (e.g. 【ಸರಸ್ವತಿ ಕೃಪೆ & ವಿದ್ಯಾಭ್ಯಾಸ ಮಾರ್ಗದರ್ಶನ】 / 【Saraswati Grace & Learning Guidance】): Prescribe daily morning Saraswati / Ganesha invocation, keeping study desk uncluttered, and nurturing their natural intellectual curiosity.

${JSON_RULE}
{"marriage":"three paragraphs of 5-6 lines each"}`
  : isSenior ? `${header(
    input,
    "bhavishyaSeniorCompanionship",
    "You are a revered Vedic master astrologer providing an in-depth reading on Companionship, Domestic Harmony, and Mutual Care for senior native " + input.name + "."
  )}
CRITICAL SENIOR CITIZEN MANDATE:
The native is a respected senior citizen (${Math.floor(input.ageYears)} years old). Treat with profound reverence. Focus on lifelong spiritual companionship, domestic serenity, mutual health care, and peaceful household harmony. NEVER suggest wedding proposals or matchmaking.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (approx. 75-100 words / 350-500 characters per paragraph). Speak directly to 'you'.
7th House Sign: ${h7.sign}. 7th House Lord: ${h7.lordStr} placed ${h7.lordWhere}. Vivahakaraka: ${input.gender === "Female" ? "Guru (Jupiter)" : "Shukra (Venus)"}. Running ${dashaLine}.
Paragraph 1: Lifelong emotional companionship, mutual understanding, and spiritual peace at home under running ${dashaLine}.
Paragraph 2: Mutual health care, calm domestic rhythms, standing as a revered pillar for the entire family.
Paragraph 3: DEDICATED DOMESTIC SERENITY starting with 【...】 (e.g. 【ದಾಂಪತ್ಯ ಸೌಖ್ಯ & ಗೌರಿ-ಶಂಕರ ಆರಾಧನೆ】 / 【Marital Serenity & Spiritual Bond】): Prescribe daily Gauri-Shankara contemplation, peaceful evening walks, and holy Kshetra darshana for domestic tranquility.

${JSON_RULE}
{"marriage":"three paragraphs of 5-6 lines each"}`
  : isYouth ? `${header(
    input,
    "bhavishyaYouthFocus",
    "You are a revered Vedic master astrologer providing an in-depth reading on Character Formation, Emotional Balance, and Mental Focus for youth " + input.name + "."
  )}
CRITICAL YOUTH / STUDENT MANDATE:
The native is a student/youth (${Math.floor(input.ageYears)} years old). Focus on emotional maturity, focus, self-discipline, and strong moral character. NEVER suggest marriage timing or romantic matchmaking.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (approx. 75-100 words / 350-500 characters per paragraph). Speak directly to 'you'.
Lagna: ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}). Moon Sign: ${rashiName(input.moonRashiIndex, lang)}. Running ${dashaLine}.
Paragraph 1: Emotional maturity, mental focus, concentration stamina, and resilience against stress.
Paragraph 2: Constructive peer circles, steering clear of premature distractions, and building strong ethical character.
Paragraph 3: DEDICATED CHARACTER GUIDANCE starting with 【...】 (e.g. 【ವ್ಯಕ್ತಿತ್ವ ವಿಕಾಸ & ಏಕಾಗ್ರತೆ】 / 【Character Formation & Mental Focus】): Daily morning Surya Namaskar, Gayatri prayer, and balanced digital hygiene for razor-sharp concentration.

${JSON_RULE}
{"marriage":"three paragraphs of 5-6 lines each"}`
  : `${header(
    input,
    "bhavishyaMarriage",
    "You are a revered Vedic master astrologer providing an in-depth, authentic reading on Marriage, Compatibility, and Partnerships for " + input.name + "."
  )}
CRITICAL MANDATE:
Write exhaustive, deeply personalized astrological analysis strictly based on ${input.name}'s Janma Kundali.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (minimum 350-500 characters per paragraph). Speak directly to 'you'.

Marriage & Partnerships (User Selected Status: ${maritalSel.toUpperCase()}):
- 7th House Sign: ${h7.sign}. 7th House Lord: ${h7.lordStr} placed ${h7.lordWhere}.
- Occupants of 7th House: ${h7.occStr}.
- Vivahakaraka: ${input.gender === "Female" ? `Guru (Jupiter) placed ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house}` : "in chart"}` : `Shukra (Venus) placed ${venusPlacement ? `in Bhava ${venusPlacement.house}` : "in chart"}`}.
- Kuja/Manglik: ${isManglik ? `Yes, Mars in Bhava ${marsPlacement?.house} causing Kuja Dosha` : "No Kuja Dosha"}.
- Direction of Partner: ${spouseDirection}.
- Running ${dashaLine}.
${hasMarriageDosha
  ? `CRITICAL DOSHA DETECTED: Write EXACTLY THREE detailed paragraphs:
    Paragraph 1: Grounded in 7th lord ${h7.lordStr} ${h7.lordWhere}, running ${dashaLine}, and transit influences. Analyze how these planets govern mutual trust, domestic stability, and emotional depth.
    Paragraph 2: Detailed psychological and practical dynamics of partnership—mutual respect in financial and household decisions, spouse's temperament reflecting ${h7.lordStr} and 7th house qualities, and shared milestones.${childrenSel === 'no_children' ? ' Focus on mutual emotional sanctuary, standing as anchors for each other, and facing societal questions together.' : ''}
    Paragraph 3: DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ವಿವಾಹ ಶಾಂತಿ】 / 【Dosha Analysis & Relationship Shanti】): Analyze the detected ${isManglik ? "Kuja/Manglik Dosha" : "7th/8th house affliction"} in this chart. ${maritalSel === "married" ? "Since the native is ALREADY MARRIED, strictly focus on domestic harmony, resolving occasional ego friction, and mutual communication—never 'delay in marriage'." : "Discuss alliance selection, avoiding hasty decisions, and favorable timing."} Prescribe specific Vedic remedies (${isManglik ? "Subramanya / Mangala Pooja at Sri Kshetra Gokarna Mahabaleshwara" : "Lakshmi-Narayana / Gauri-Shankara Pooja"}).`
  : `NO DOSHA PRESENT: Write EXACTLY THREE detailed paragraphs:
    Paragraph 1: Grounded in 7th lord ${h7.lordStr} ${h7.lordWhere}, running ${dashaLine}, and transit influences. Analyze how these planets govern mutual trust, domestic stability, and emotional depth.
    Paragraph 2: Detailed psychological and practical dynamics of partnership—mutual respect in financial and household decisions, spouse's temperament reflecting ${h7.lordStr} and 7th house qualities, and domestic harmony.
    Paragraph 3: DEDICATED PLANETARY STRENGTHS & MARITAL HARMONY starting with 【...】 (e.g. 【ದಾಂಪತ್ಯ ಸೌಖ್ಯ & ದೈವಿಕ ಮಾರ್ಗದರ್ಶನ】 / 【Marital Harmony & Auspicious Guidance】): Highlight benefic planetary aspects, auspicious transit timing, deep mutual trust, spiritual synergy between partners, and prescribe weekly Lakshmi-Narayana archana and cow ghee lamp offering for lasting domestic happiness.`
}

${JSON_RULE}
{"marriage":"three paragraphs of 5-6 lines each"}`;

  const bhavishyaChildren = isChild ? `${header(
    input,
    "bhavishyaChildActivities",
    "You are a revered Vedic master astrologer providing an in-depth reading on Talents, Creative Activities, and Sports for child " + input.name + "."
  )}
CRITICAL CHILD HOROSCOPE MANDATE:
The native is a child (${Math.floor(input.ageYears)} years old). Focus on extracurricular interests, sports, fine arts, hobbies, and active energy channeling.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (minimum 350-500 characters per paragraph).
3rd House (Parakrama): ${getHouseInfo(3).sign}. 5th House: ${h5.sign}. Mars: ${marsPlacement ? `in Bhava ${marsPlacement.house}` : "present"}. Venus: ${venusPlacement ? `in Bhava ${venusPlacement.house}` : "present"}.
Paragraph 1: Physical vigor, athletic stamina, sports enthusiasm, and motor coordination.
Paragraph 2: Creative inclinations, artistic expression, music, drawing, storytelling, and imaginative hobbies.
Paragraph 3: DEDICATED TALENTS GUIDANCE starting with 【...】 (e.g. 【ಪ್ರತಿಭಾ ವಿಕಾಸ & ಕೌಶಲ್ಯ ಮಾರ್ಗದರ್ಶನ】 / 【Talents & Creative Expansion Guidance】): Encouraging positive extracurricular pursuits, team spirit, and creative confidence.

${JSON_RULE}
{"children":"three paragraphs of 5-6 lines each"}`
  : isSenior ? `${header(
    input,
    "bhavishyaSeniorLegacy",
    "You are a revered Vedic master astrologer providing an in-depth reading on Family Legacy, Continuity, and Joy of Grandchildren for senior native " + input.name + "."
  )}
CRITICAL SENIOR CITIZEN MANDATE:
The native is a respected senior citizen (${Math.floor(input.ageYears)} years old). Focus on family lineage, joy and bonding with children and grandchildren, and passing down cultural wisdom.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (minimum 350-500 characters per paragraph). Speak directly to 'you'.
5th House Sign: ${h5.sign}. 5th House Lord: ${h5.lordStr} placed ${h5.lordWhere}. Putrakaraka Jupiter: placed ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house}` : "in chart"}.
Paragraph 1: Fruitful fruition of Poorva Punya through grown children well-settled in their lives and vocations.
Paragraph 2: Joy of grandchildren (Poutra-Poutri sukha), warm intergenerational bonding, and peaceful family gatherings.
Paragraph 3: DEDICATED LINEAGE BLESSINGS starting with 【...】 (e.g. 【ವಂಶೋದ್ಧಾರ & ಸಕಲ ಸಂತತಿ ರಕ್ಷಣೆ】 / 【Generational Continuity & Lineage Blessings】): Prayers to Lord Ganapati and Sri Santana Gopala for family longevity, and passing moral values with warmth.

${JSON_RULE}
{"children":"three paragraphs of 5-6 lines each"}`
  : isYouth ? `${header(
    input,
    "bhavishyaYouthStudies",
    "You are a revered Vedic master astrologer providing an in-depth reading on Higher Education, Scholastic Distinction, and Intellect for youth " + input.name + "."
  )}
CRITICAL YOUTH / STUDENT MANDATE:
The native is a student (${Math.floor(input.ageYears)} years old). Focus on higher studies, competitive exams, memory retention, and academic distinctions.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (minimum 350-500 characters per paragraph). Speak directly to 'you'.
5th House Sign: ${h5.sign}. 5th House Lord: ${h5.lordStr} placed ${h5.lordWhere}. Putrakaraka Jupiter: ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house}` : "present"}. Mercury: ${input.natalPlanets.find(p => p.graha === "Mercury") ? `in Bhava ${input.natalPlanets.find(p => p.graha === "Mercury")!.house}` : "present"}.
Paragraph 1: Academic focus, memory retention, grasping complex curricula, and examination preparation.
Paragraph 2: Analytical reasoning, competitive test composure, strategic revision, and scholarly discipline.
Paragraph 3: DEDICATED ACADEMIC BLESSINGS starting with 【...】 (e.g. 【ವಿದ್ಯಾ ಸಾಧನೆ & ಸರಸ್ವತಿ ಅನುಗ್ರಹ】 / 【Scholastic Excellence & Saraswati Grace】): Daily chanting of Saraswati Mantra and Ganapati Atharvashirsha for intellectual illumination and exam success.

${JSON_RULE}
{"children":"three paragraphs of 5-6 lines each"}`
  : `${header(
    input,
    "bhavishyaChildren",
    "You are a revered Vedic master astrologer providing an in-depth, authentic reading on Children and Progeny for " + input.name + "."
  )}
CRITICAL MANDATE:
Write exhaustive, deeply personalized astrological analysis strictly based on ${input.name}'s Janma Kundali.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (minimum 350-500 characters per paragraph). Speak directly to 'you'.

Children & Progeny (User Selected Status: ${childrenSel.toUpperCase()}):
- 5th House Sign: ${h5.sign}. 5th House Lord: ${h5.lordStr} placed ${h5.lordWhere}.
- Occupants of 5th House: ${h5.occStr}.
- Putrakaraka Jupiter (Guru): placed ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house} (${rashiName(jupiterPlacement.rashiIndex, lang)})` : "in chart"}.
- Progeny Transit: Jupiter transit ${guruTransit?.houseFromMoon} from Chandra. Running ${dashaLine}.
${hasSantanaDosha
  ? `CRITICAL DOSHA DETECTED (Santana/5th House Affliction): Write EXACTLY THREE detailed paragraphs:
    Paragraph 1: Detailed analysis of 5th house ${h5.sign}, 5th lord ${h5.lordStr} ${h5.lordWhere}, and Putrakaraka Jupiter.${childrenSel === 'no_children' ? ' Deep emotional validation of the quiet, unspoken longing and heartfelt prayers for a child, emphasizing that lineage continuity is preserved in Poorva Punya.' : ' Analysis of children\'s intellect, academic focus, and moral character.'}
    Paragraph 2: Astrological timing, transit support, and parental/household guidance.${childrenSel === 'no_children' ? ' Reassure them with warmth that delays are periods of karmic refinement, not denial; encourage standing united.' : ' Children\'s future growth, specialized talents, and spiritual harmony.'}
    Paragraph 3: DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಸಂತಾನ ಶಾಂತಿ】 / 【Dosha Analysis & Progeny Shanti】): Analyze the detected 5th house affliction (Naga/Sarpa Dosha, Rahu-Ketu axis, or Saturn influence) and prescribe sacred Vedic remedies: Daily Santana Gopala Mantra, Thursday Gau-seva, and Subrahmanya / Naga Shanti Pooja at Sri Kshetra Gokarna Mahabaleshwara.`
  : `NO DOSHA PRESENT: Write EXACTLY THREE detailed paragraphs:
    Paragraph 1: Detailed analysis of 5th house ${h5.sign}, 5th lord ${h5.lordStr} ${h5.lordWhere}, and Putrakaraka Jupiter.${childrenSel === 'no_children' ? ' Warm emotional validation of their family aspirations and fertile astrological windows.' : ' Analysis of children\'s intellect, moral values, and family bonding.'}
    Paragraph 2: Educational support, intellectual legacy, and divine family blessings.
    Paragraph 3: DEDICATED PROGENY BLESSINGS & SACRED GUIDANCE starting with 【...】 (e.g. 【ಸಂತಾನ ಭಾಗ್ಯ & ಶುಭ ಮಾರ್ಗದರ್ಶನ】 / 【Progeny Blessings & Sacred Guidance】): ${childrenSel === 'no_children' ? 'Reaffirm auspicious upcoming planetary windows for conception. Prescribe daily joint recitation of the sacred Santana Gopala Mantra, Thursday Gau-seva (feeding cows jaggery/grass), and seeking blessings at Sri Kshetra Gokarna Mahabaleshwara for healthy progeny.' : 'Highlight the children\'s positive intellectual and karmic trajectory, encouraging parental dharma, family prayers, and noble heritage.'}`
}

${JSON_RULE}
{"children":"three paragraphs of 5-6 lines each"}`;

  const bhavishyaCareer = isChild ? `${header(
    input,
    "bhavishyaChildFoundation",
    "You are a revered Vedic master astrologer providing an in-depth reading on Future Foundation, Character, and Moral Discipline for child " + input.name + "."
  )}
CRITICAL CHILD HOROSCOPE MANDATE:
The native is a child (${Math.floor(input.ageYears)} years old). Focus on building strong ethical foundations, noble character, and childhood discipline. DO NOT discuss adult employment or corporate jobs.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (minimum 350-500 characters per paragraph).
Paragraph 1: Ethical orientation, honesty, moral values, and innate leadership potential.
Paragraph 2: Developing good daily habits, respect towards teachers and elders, and perseverance.
Paragraph 3: DEDICATED FOUNDATION GUIDANCE starting with 【...】 (e.g. 【ಸಂಸ್ಕಾರ & ಭವಿಷ್ಯದ ಅಡಿಪಾಯ】 / 【Samskaras & Character Foundation】): Instilling timeless Dharmic ideals, patience, and noble life orientation.

${JSON_RULE}
{"career":"three paragraphs of 5-6 lines each"}`
  : isSenior ? `${header(
    input,
    "bhavishyaSeniorLeadership",
    "You are a revered Vedic master astrologer providing an in-depth reading on Mentorship, Dharmic Leadership, and Social Respect for senior native " + input.name + "."
  )}
CRITICAL SENIOR CITIZEN MANDATE:
The native is a senior citizen (${Math.floor(input.ageYears)} years old). Focus on mentorship, dharmic activities, philanthropy, and societal guidance. NEVER suggest seeking new corporate jobs or job changes.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (minimum 350-500 characters per paragraph). Speak directly to 'you'.
10th House: ${h10.sign} (Lord ${h10.lordStr} placed ${h10.lordWhere}). Saturn: placed ${saturnPlacement ? `in Bhava ${saturnPlacement.house}` : "in chart"}.
Paragraph 1: Societal respect, honored standing as a community elder, and sharing wisdom gained over decades.
Paragraph 2: Dharmic leadership, guiding younger family members, charitable work, and spiritual satisfaction.
Paragraph 3: DEDICATED DHARMIC GUIDANCE starting with 【...】 (e.g. 【ಧರ್ಮ ಮಾರ್ಗದರ್ಶನ & ಆಧ್ಯಾತ್ಮಿಕ ಗೌರವ】 / 【Dharmic Leadership & Spiritual Honor】): Devoting time to spiritual satsangs, temple philanthropy, and imparting cultural values.

${JSON_RULE}
{"career":"three paragraphs of 5-6 lines each"}`
  : isYouth ? `${header(
    input,
    "bhavishyaYouthCareerFoundation",
    "You are a revered Vedic master astrologer providing an in-depth reading on Future Vocational Direction and Career Foundation for youth " + input.name + "."
  )}
CRITICAL YOUTH / STUDENT MANDATE:
The native is a youth (${Math.floor(input.ageYears)} years old). Focus on discovering natural talents, career foundation, skill building, and professional aspirations.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (minimum 350-500 characters per paragraph). Speak directly to 'you'.
10th House: ${h10.sign} (Lord ${h10.lordStr} placed ${h10.lordWhere}). Karmakaraka Saturn: ${saturnPlacement ? `in Bhava ${saturnPlacement.house}` : "present"}. Sun: dignity in chart.
Paragraph 1: Innate career inclinations, vocational fields aligned with the 10th house, and natural skills.
Paragraph 2: Developing professional competencies, practical internships, industry skills, and goal clarity.
Paragraph 3: DEDICATED CAREER PREPARATION starting with 【...】 (e.g. 【ವೃತ್ತಿ ಅಡಿಪಾಯ & ಯಶಸ್ಸಿನ ಮಾರ್ಗ】 / 【Career Foundation & Vocational Direction】): Fostering perseverance, mentorship guidance, and Aditya Hridaya prayer for strong leadership acumen.

${JSON_RULE}
{"career":"three paragraphs of 5-6 lines each"}`
  : `${header(
    input,
    "bhavishyaCareer",
    "You are a revered Vedic master astrologer providing an in-depth reading on Career, Vocation, and Professional Ascent for " + input.name + "."
  )}
CRITICAL MANDATE:
Write exhaustive, deeply personalized analysis strictly based on ${input.name}'s Janma Kundali.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (approx. 75-100 words / 350-500 characters per paragraph). Speak directly to 'you'.

10th House Sign: ${h10.sign}. 10th House Lord: ${h10.lordStr} placed ${h10.lordWhere}.
Occupants of 10th House: ${h10.occStr}.
Karmakaraka Saturn (Shani): placed ${saturnPlacement ? `in Bhava ${saturnPlacement.house} (${rashiName(saturnPlacement.rashiIndex, lang)})` : "in chart"}.
Running period: ${dashaLine}.
Paragraph 1: Professional stability, leadership prospects, vocational aptitude, and timing under running ${dashaLine}.
Paragraph 2: Strategic workplace navigation, career growth, transitions, and public reputation.
${hasCareerDosha
  ? `Paragraph 3: DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಕರ್ಮ ಶಾಂತಿ】 / 【Dosha Analysis & Career Remedy】): Analyze the detected 10th house / Karma dosha, explain obstacle mechanisms, and detail Shani Shanti pooja, Dasharatha Stotram, and Rudrabhishekam at Sri Kshetra Gokarna Mahabaleshwara.`
  : `Paragraph 3: DEDICATED CAREER ASCENT & LEADERSHIP GUIDANCE starting with 【...】 (e.g. 【ವೃತ್ತಿ ಪ್ರಗತಿ & ಯಶಸ್ಸಿನ ಮಾರ್ಗದರ್ಶನ】 / 【Career Ascent & Leadership Guidance】): Emphasize natural vocational leadership, optimal timing for career milestones under running dasha, team collaboration, and Rudrabhishekam / Aditya Hridaya prayer for continuous career distinction.`
}

${JSON_RULE}
{"career":"three paragraphs of 5-6 lines each"}`;

  const bhavishyaWealth = isChild ? `${header(
    input,
    "bhavishyaChildFamily",
    "You are a revered Vedic master astrologer providing an in-depth reading on Family Environment, Nurturing, and Auspicious Upbringing for child " + input.name + "."
  )}
CRITICAL CHILD HOROSCOPE MANDATE:
The native is a child (${Math.floor(input.ageYears)} years old). Focus on home atmosphere, parental affection, and emotional security. DO NOT discuss stock market or commercial investments.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (minimum 350-500 characters per paragraph).
2nd House (Kutumba): ${getHouseInfo(2).sign} (Lord ${getHouseInfo(2).lordStr} ${getHouseInfo(2).lordWhere}). 4th House (Matru/Sukha): ${getHouseInfo(4).sign}.
Paragraph 1: Family warmth, emotional security, and harmonious home environment.
Paragraph 2: Positive parental values, gentle guidance, and nurturing household atmosphere.
Paragraph 3: DEDICATED FAMILY SANCTUARY starting with 【...】 (e.g. 【ಕೌಟುಂಬಿಕ ಸೌಖ್ಯ & ದೈವಿಕ ರಕ್ಷಣೆ】 / 【Family Sanctuary & Divine Harmony】): Maintaining auspicious vibrations at home, mutual family affection, and family prayers.

${JSON_RULE}
{"wealth":"three paragraphs of 5-6 lines each"}`
  : isSenior ? `${header(
    input,
    "bhavishyaSeniorWealthPreservation",
    "You are a revered Vedic master astrologer providing an in-depth reading on Wealth Preservation, Estate Peace, and Financial Security for senior native " + input.name + "."
  )}
CRITICAL SENIOR CITIZEN MANDATE:
The native is a senior citizen (${Math.floor(input.ageYears)} years old). Focus on financial preservation, safe retirement assets, estate security, and contentment. NEVER suggest aggressive speculations.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (minimum 350-500 characters per paragraph). Speak directly to 'you'.
2nd House: ${h2.sign} (Lord ${h2.lordStr} placed ${h2.lordWhere}). 11th House: ${h11.sign}. Jupiter: ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house}` : "present"}.
Paragraph 1: Financial security, safe asset consolidation, and retirement peace under running ${dashaLine}.
Paragraph 2: Estate planning, safeguarding ancestral wealth, and providing generational stability.
Paragraph 3: DEDICATED WEALTH PRESERVATION starting with 【...】 (e.g. 【ಸಂಪತ್ತು ಸಂರಕ್ಷಣೆ & ಶಾಶ್ವತ ಭದ್ರತೆ】 / 【Wealth Preservation & Eternal Security】): Keeping investments in low-risk avenues, Lakshmi Kubera prayers, and philanthropic satisfaction.

${JSON_RULE}
{"wealth":"three paragraphs of 5-6 lines each"}`
  : isYouth ? `${header(
    input,
    "bhavishyaYouthFinancialDiscipline",
    "You are a revered Vedic master astrologer providing an in-depth reading on Financial Discipline, Resource Management, and Practical Values for youth " + input.name + "."
  )}
CRITICAL YOUTH / STUDENT MANDATE:
The native is a student/youth (${Math.floor(input.ageYears)} years old). Focus on cultivating financial prudence, understanding the value of money, and avoiding wasteful expenditures.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (minimum 350-500 characters per paragraph). Speak directly to 'you'.
2nd House: ${h2.sign} (Lord ${h2.lordStr} placed ${h2.lordWhere}). 11th House: ${h11.sign}.
Paragraph 1: Developing prudent money habits, understanding family resources, and budgeting basics.
Paragraph 2: Avoiding trend-driven impulse spending, cultivating smart saving habits early in life.
Paragraph 3: DEDICATED FINANCIAL WISDOM starting with 【...】 (e.g. 【ಆರ್ಥಿಕ ಶಿಸ್ತು & ಸಂಪತ್ತಿನ ಮೌಲ್ಯ】 / 【Financial Discipline & Prudence】): Investing in self-education and skills as the greatest wealth generator, and honoring Goddess Mahalakshmi.

${JSON_RULE}
{"wealth":"three paragraphs of 5-6 lines each"}`
  : `${header(
    input,
    "bhavishyaWealth",
    "You are a revered Vedic master astrologer providing an in-depth reading on Wealth, Assets, and Financial Destiny for " + input.name + "."
  )}
CRITICAL MANDATE:
Write exhaustive, deeply personalized analysis strictly based on ${input.name}'s Janma Kundali.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (approx. 75-100 words / 350-500 characters per paragraph). Speak directly to 'you'.

2nd House (Accumulated Wealth): ${h2.sign} (Lord ${h2.lordStr} ${h2.lordWhere}, occupants: ${h2.occStr}).
11th House (Income & Gains): ${h11.sign} (Lord ${h11.lordStr} ${h11.lordWhere}, occupants: ${h11.occStr}).
Dhanakaraka Jupiter: ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house}` : "present"}.
Running period: ${dashaLine}.
Paragraph 1: Financial accumulation, investments, property gains, and income growth under running ${dashaLine}.
Paragraph 2: Liquidity planning, family prosperity, asset consolidation, and wealth preservation.
${hasWealthDosha
  ? `Paragraph 3: DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಧನ ಸಮೃದ್ಧಿ ಶಾಂತಿ】 / 【Dosha Analysis & Financial Shanti】): Analyze the detected financial affliction, obstacle resolution, and prescribe Lakshmi Kubera Aradhana and cow ghee lamp remedy.`
  : `Paragraph 3: DEDICATED WEALTH PROSPERITY & DHANAKARAKA BLESSING starting with 【...】 (e.g. 【ಧನ ಸಮೃದ್ಧಿ & ಆರ್ಥಿಕ ಯೋಗ】 / 【Wealth Prosperity & Investment Guidance】): Emphasize strong wealth accumulation yogas, strategic investment preservation, family prosperity, and prescribe weekly Lakshmi Kubera prayers and offering pure cow ghee lamps for financial auspiciousness.`
}

${JSON_RULE}
{"wealth":"three paragraphs of 5-6 lines each"}`;

  const bhavishyaHealth = isChild ? `${header(
    input,
    "bhavishyaChildHealth",
    "You are a revered Vedic master astrologer providing an in-depth reading on Pediatric Health, Vitality, and Natural Immunity for child " + input.name + "."
  )}
CRITICAL CHILD HOROSCOPE MANDATE:
The native is a child (${Math.floor(input.ageYears)} years old). Focus on natural immunity, seasonal pediatric wellness, nutrition, and vital stamina.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (minimum 350-500 characters per paragraph).
1st House: ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}). 6th House: ${h6.sign}. Moon & Sun dignity in chart.
Paragraph 1: Natural physical immunity, seasonal vulnerability precautions, and vitality rhythms.
Paragraph 2: Balanced sleep schedules, nutritious wholesome foods, and active play outdoors.
Paragraph 3: DEDICATED PEDIATRIC HEALTH GUIDANCE starting with 【...】 (e.g. 【ಬಾಲ ಆರೋಗ್ಯ & ಆಯುಷ್ಯ ರಕ್ಷಣೆ】 / 【Pediatric Vitality & Divine Shield】): Morning sunlight, pure hydration, wholesome diet, and Dhanvantari prayer for robust childhood vigor.

${JSON_RULE}
{"health":"three paragraphs of 5-6 lines each"}`
  : isSenior ? `${header(
    input,
    "bhavishyaSeniorLongevity",
    "You are a revered Vedic master astrologer providing an in-depth reading on Longevity, Geriatric Wellness, and Health Preservation for senior native " + input.name + "."
  )}
CRITICAL SENIOR CITIZEN MANDATE:
The native is a senior citizen (${Math.floor(input.ageYears)} years old). Focus on longevity, gentle physical wellness, emotional equanimity, and restful sleep.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (minimum 350-500 characters per paragraph). Speak directly to 'you'.
1st House: ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}). 6th House: ${h6.sign}. 8th House (Ayushya): ${h8.sign}. Running ${dashaLine}.
Paragraph 1: Physical health stability, joint and digestive care, and maintaining stamina in senior years.
Paragraph 2: Emotional peace, regular sleep hygiene, gentle walking, and Pranayama breathing.
Paragraph 3: DEDICATED LONGEVITY GUIDANCE starting with 【...】 (e.g. 【ಆಯುಷ್ಯ ವೃದ್ಧಿ & ಸ್ವಾಸ್ಥ್ಯ ರಕ್ಷಣೆ】 / 【Longevity & Geriatric Wellness Guidance】): Daily Mahamrityunjaya prayer, light Ayurvedic nutrition, warm water habits, and Gokarna Mrityunjaya blessings.

${JSON_RULE}
{"health":"three paragraphs of 5-6 lines each"}`
  : isYouth ? `${header(
    input,
    "bhavishyaYouthFitness",
    "You are a revered Vedic master astrologer providing an in-depth reading on Vitality, Fitness, and Lifestyle Balance for youth " + input.name + "."
  )}
CRITICAL YOUTH / STUDENT MANDATE:
The native is a youth (${Math.floor(input.ageYears)} years old). Focus on physical vigor, sports stamina, mental equanimity, and balancing screen time with restful sleep.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (minimum 350-500 characters per paragraph). Speak directly to 'you'.
1st House: ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}). 6th House: ${h6.sign}. Sun & Mars dignity.
Paragraph 1: Physical stamina, active fitness habits, metabolism, and endurance.
Paragraph 2: Mental equanimity, mitigating screen fatigue, eye care, and regular sleep schedule.
Paragraph 3: DEDICATED VITALITY GUIDANCE starting with 【...】 (e.g. 【ಯುವ ಚೈತನ್ಯ & ಆರೋಗ್ಯ ಸಮತೋಲನ】 / 【Youth Fitness & Vitality Balance】): Morning Surya Namaskar, outdoor sports, wholesome hydration, and Dhanvantari prayer for luminous vitality.

${JSON_RULE}
{"health":"three paragraphs of 5-6 lines each"}`
  : `${header(
    input,
    "bhavishyaHealth",
    "You are a revered Vedic master astrologer providing an in-depth reading on Health, Vitality, and Longevity for " + input.name + "."
  )}
CRITICAL MANDATE:
Write exhaustive, deeply personalized analysis strictly based on ${input.name}'s Janma Kundali.
Write STRICTLY THREE (3) EXPANSIVE PARAGRAPHS, with EACH PARAGRAPH containing AT LEAST 5 to 6 FULL LINES (approx. 75-100 words / 350-500 characters per paragraph). Speak directly to 'you'.

1st House (Lagna / Physical Constitution): ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}).
6th House (Roga Sthana): ${h6.sign} (Lord ${h6.lordStr} ${h6.lordWhere}).
Sun (Vitality) and Moon (Mental Equanimity) dignity in chart.
Running period: ${dashaLine}.

CRITICAL HEALTH REALITY MANDATE:
- Lagna governing area: ${lagnaAnatomy}.
- 6th House governing area: ${rogaAnatomy}.
Mention explicitly what bodily vulnerabilities and physical sensations ${input.name} has been facing or is prone to (specifically ${rogaAnatomy}, ${lagnaAnatomy}, sleep changes, or digestive sensitivities under stress) so they are stunned by the lifelike 100% accuracy of the reading.
Paragraph 1: Physical constitution, vitality, seasonal wellness precautions, and metabolic stamina.
Paragraph 2: Mental equanimity, stress management, sleep quality, and daily Ayurvedic lifestyle.
${hasHealthDosha
  ? `Paragraph 3: DEDICATED DOSHA ANALYSIS starting with 【...】 (e.g. 【ದೋಷ ವಿಶ್ಲೇಷಣೆ & ಆರೋಗ್ಯ ರಕ್ಷಾ ಶಾಂತಿ】 / 【Dosha Analysis & Health Shield Shanti】): Analyze the detected 6th/8th house roga affliction, and prescribe Mahamrityunjaya japa, Dhanvantari prayer, and Gokarna Mrityunjaya homa.`
  : `Paragraph 3: DEDICATED VITALITY & LONGEVITY SHIELD starting with 【...】 (e.g. 【ಆರೋಗ್ಯ ಸಂರಕ್ಷಣೆ & ದೀರ್ಘಾಯುಷ್ಯ ಮಾರ್ಗದರ್ಶನ】 / 【Vitality Preservation & Wellness Guidance】): Healthy morning Surya Namaskar, Ayurvedic seasonal balance, daily Prana cultivation, and Dhanvantari prayer for robust lifelong immunity and vitality.`
}

${JSON_RULE}
{"health":"three paragraphs of 5-6 lines each"}`;

  const bhavishyaAnnualForecast = `${header(
    input,
    "bhavishyaAnnualForecast",
    "You are a revered Vedic master astrologer composing a profound, deeply emotional 1-year destiny forecast for devotee " + input.name + " based on their Janma Kundali, running Dasha-Bhukti, and upcoming Gochara."
  )}
CRITICAL 1-YEAR DESTINY & EMOTIONAL FORECAST MANDATE:
Write an exceptionally moving, intimate, and astrologically authoritative forecast covering the next 12 MONTHS (1 full year) for ${input.name}.
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
    "You are a revered Vedic master astrologer closing the reading for " + input.name + ", synthesizing their chart with profound personal warmth, wisdom, and spiritual authority."
  )}
CRITICAL PERSONAL CONNECTION & SYNTHESIS REQUIREMENT:
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
    timeline,
    summary,
    maandiInquest
  };
};
