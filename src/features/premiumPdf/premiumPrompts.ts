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
  ageYears: number;
  maritalStatus?: "unmarried" | "married";
  hasChildren?: "no_children" | "has_children";

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
    `Age now: ${Math.floor(input.ageYears)}`,
    `Lagna: ${rashiName(input.lagnaRashiIndex, lang)}`,
    `Chandra rashi: ${rashiName(input.moonRashiIndex, lang)}`,
    `Janma nakshatra: ${nakshatraName(input.moonNakshatraIndex, lang)}`,
    `Surya rashi: ${rashiName(input.sunRashiIndex, lang)}`,
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

  const characteristics = `${header(
    input,
    "characteristics",
    "You are an authoritative Vedic astrologer writing a 100% mathematically accurate personality analysis strictly grounded in computed chart placements."
  )}
Extra material for this chapter only:
Shadow side found by the engine: ${input.shadowSelf}
Karmic pattern found by the engine: ${input.karmicBaggage}

CRITICAL ACCURACY REQUIREMENT:
Write EXACTLY TWO detailed paragraphs about this person's personality, core nature, and behavioral traits.
STRICT LENGTH RULE: EACH PARAGRAPH MUST CONTAIN AT LEAST 5 FULL, SUBSTANTIAL LINES OF TEXT (minimum 10 lines total for the section).
MUST BE 100% MATHEMATICALLY ACCURATE to the birth chart above. Explicitly analyze their specific Lagna (${rashiName(input.lagnaRashiIndex, lang)}), Chandra Rashi (${rashiName(input.moonRashiIndex, lang)}), Janma Nakshatra (${nakshatraName(input.moonNakshatraIndex, lang)}), running ${dashaLine}, and current Gochara transits. Describe their core temperament, strengths, inner drive, and behavioral nuances strictly based on these planetary placements. ZERO generic statements or unverified claims.

${JSON_RULE}
{"characteristics":[{"impact":"paragraph one\\n\\nparagraph two"}]}`;

  const darkSecret = `${header(
    input,
    "darkSecret",
    "You are an authoritative Vedic astrologer revealing the hidden soul pattern strictly based on 8th/12th house placements and karmic planets."
  )}
Extra material for this chapter only:
Shadow: ${input.shadowSelf}
Karma: ${input.karmicBaggage}
${input.affairNote}

CRITICAL ACCURACY REQUIREMENT:
Reveal the single deepest hidden pattern of THIS chart — the niguda rahasya (hidden dark secret).
STRICT LENGTH RULE: Write EXACTLY TWO PARAGRAPHS, and EACH PARAGRAPH MUST CONTAIN AT LEAST 5 FULL, SUBSTANTIAL LINES OF TEXT (minimum 10 lines total for the section).
MUST BE 100% MATHEMATICALLY ACCURATE to the 8th/12th house placements, Rahu/Ketu/Saturn karmic influences, running ${dashaLine}, and planetary transits in THIS chart.
Paragraph one: The hidden karmic pattern, subconscious vulnerabilities, and secret emotional struggles tied directly to named placements above.
Paragraph two: How this pattern manifests in daily life, karmic relationships, and the precise spiritual remedy and transformation required to overcome it.
Do not moralise, do not frighten, end on what can be healed and transformed.

${JSON_RULE}
{"darkSecret":[{"impact":"paragraph one\\n\\nparagraph two"}]}`;

  const yogas = `${header(
    input,
    "yogas",
    "You are a classical scholar of yoga formations who enjoys explaining why a combination is fortunate."
  )}
YOUR TASK
Take the yogas listed in the chart facts and explain each one properly.
For EACH yoga write AT LEAST TWO full paragraphs in the 'impact' field: what the combination is,
which grahas in THIS chart form it, what it has already given this person, and what it can still give.
If the engine listed no yoga, read the placements above and name the two strongest genuine
combinations you can actually see. Never invent a yoga the placements do not support.

${JSON_RULE}
{"yogas":[{"name":"name of the yoga","impact":"two or more paragraphs"}]}`;

  const doshas = `${header(
    input,
    "doshas",
    "You are an astrologer who treats afflictions as solvable problems, never as curses."
  )}
YOUR TASK
Take the doshas listed in the chart facts and explain each one properly.
For EACH dosha write AT LEAST TWO full paragraphs in the 'impact' field: what the combination is,
which grahas form it in THIS chart, how it manifests, and what to do about it.
Name the remedy clearly. If the engine found no dosha, read the chart facts above and describe the
single strongest planetary challenge in this chart accurately.

${JSON_RULE}
{"doshas":[{"name":"name of the dosha","impact":"two or more paragraphs","remedy":"practical remedy"}]}`;

  const gochara = `${header(
    input,
    "gochara",
    "You are an astrologer evaluating current transits against the birth Moon."
  )}
YOUR TASK
Use the transit list in the chart facts — those are the real current positions, counted from
the birth Chandra rashi. Identify EVERY major effect now running: Sade Sati, Ashtama Shani,
Guru bala, Kantaka Shani, the Rahu-Ketu axis, and any other that the houses above genuinely show.
Do not stop at one or two. For each, write AT LEAST TWO paragraphs saying what it means for this
person right now and how long the feeling lasts, plus one practical remedy.
The 'name' field must also be in the target language.

${JSON_RULE}
{"gochara":[{"name":"name of the transit effect","impact":"two or more paragraphs","remedy":"one practical remedy"}]}`;

  const timeline = `${header(
    input,
    "timeline",
    "You are an astrologer laying out the months ahead like a farmer reading the season."
  )}
Engine roadmap for the coming months:
${roadmapText || "  (not available)"}

YOUR TASK
Provide EXACTLY SIX (6) entries in the 'timeline' array — one entry for EACH of the 6 months listed in the roadmap above.
For EACH month entry:
- 'dateRange': Write the month name and year in the target language native script (${input.lang}).
- 'impact': Write ONE detailed, generous paragraph of at least 4-5 sentences detailing the planetary influence, financial/career/health predictions, and guidance for that month.
Ensure all 6 months are covered sequentially without skipping any month.

${JSON_RULE}
{"timeline":[{"dateRange":"month and year in target script","impact":"one long detailed paragraph"}]}`;

  const currentPhase = `${header(
    input,
    "currentPhase",
    "You are an intuitive Vedic astrologer and psychological expert evaluating the person's EXACT present state of mind, current life circumstances, and immediate planetary environment."
  )}
CRITICAL ACCURACY REQUIREMENT:
Write EXACTLY FOUR (4) FULL, DETAILED PARAGRAPHS analyzing this person's current life phase based strictly on their age (${Math.floor(input.ageYears)}), Lagna (${rashiName(input.lagnaRashiIndex, lang)}), Chandra Rashi (${rashiName(input.moonRashiIndex, lang)}), running ${dashaLine}, and live Gochara transits from the facts above:
- Paragraph 1: Precise current life situation and daily circumstances happening today (career status, home environment, recent developments).
- Paragraph 2: Core emotions and psychological mindset right now (feelings of joy, stress, anticipation, or transition).
- Paragraph 3: Subconscious thoughts, hidden desires, and internal motivations driving their current decisions.
- Paragraph 4: Actionable astrological advice, planetary remedies, and mindset shifts required to navigate this phase smoothly.

MUST BE 100% MATHEMATICALLY ACCURATE to the computed Dasha-Bhukti and transits provided above.

${JSON_RULE}
{"currentPhase":[{"impact":"paragraph 1\n\nparagraph 2\n\nparagraph 3\n\nparagraph 4"}]}`;

  const maritalSel = input.maritalStatus || "unmarried";
  const childrenSel = input.hasChildren || "no_children";
  const h7Idx = input.lagnaRashiIndex !== null ? (input.lagnaRashiIndex + 6) % 12 : 6;
  const h7SignName = rashiName(h7Idx, lang);
  const h5Idx = input.lagnaRashiIndex !== null ? (input.lagnaRashiIndex + 4) % 12 : 4;
  const h5SignName = rashiName(h5Idx, lang);

  const bhavishya = `${header(
    input,
    "bhavishya",
    "You are an authoritative Vedic astrologer analyzing specific life areas based strictly on 7th house lord, 5th house lord, 10th house lord, and 2nd house lord."
  )}
CRITICAL PERSONALIZED ACCURACY REQUIREMENT:
Provide a 100% personalized astrological reading for the following 5 life categories based on this chart's exact placements:

1. Marriage & Relationships (User Selected Status: ${maritalSel.toUpperCase()}):
   - 7th House Sign: ${h7SignName}.
   - ${maritalSel === "unmarried" 
       ? "Write EXACTLY TWO detailed paragraphs for UNMARRIED status: Paragraph 1 analyzes 7th house lord placement, Venus/Jupiter aspect, running " + dashaLine + ", and live transits to predict the exact 12-18 month marriage window, spouse's personality traits, and direction of arrival relative to birthplace. Paragraph 2 details Kuja/Manglik afflictions and exact daily remedies."
       : "Write EXACTLY TWO detailed paragraphs for MARRIED status: Paragraph 1 analyzes 7th house lord placement, running " + dashaLine + ", and transit influences on mutual trust and domestic harmony. Paragraph 2 details joint career/financial growth with spouse and Lakshmi Narayan home remedies."}

2. Children & Progeny (User Selected Status: ${childrenSel.toUpperCase()}):
   - 5th House Sign: ${h5SignName}.
   - ${childrenSel === "no_children"
       ? "Write EXACTLY TWO detailed paragraphs for NO CHILDREN status: Paragraph 1 analyzes 5th house lord placement, Jupiter (Putrakaraka) aspect, running " + dashaLine + ", and 18-month transits for conception, maternal health, and Santana Yoga timing. Paragraph 2 details Santana Gopala Mantra chanting and Subramanya Seva remedies."
       : "Write EXACTLY TWO detailed paragraphs for HAS CHILDREN status: Paragraph 1 analyzes 5th house lord placement and planetary influences on children's academic success and talents. Paragraph 2 details their future growth, parental guidance, and family harmony."}

3. Career & Profession:
   - Write TWO detailed paragraphs on 10th house lord, job stability, promotions, and business growth.

4. Wealth & Family:
   - Write TWO detailed paragraphs on 2nd/11th house lords, financial accumulation, property gains, and family harmony.

5. Health & Vitality:
   - Write TWO detailed paragraphs on 1st/6th house lords, physical vitality, immune strength, and wellness remedies.

${JSON_RULE}
{"bhavishya":{"marriage":"two paragraphs","children":"two paragraphs","career":"two paragraphs","wealth":"two paragraphs","health":"two paragraphs"}}`;

  const summary = `${header(
    input,
    "summary",
    "You are the master astrologer closing the book, synthesizing the reading with 100% astrological precision."
  )}
CRITICAL ACCURACY REQUIREMENT:
Write two or three detailed paragraphs synthesizing the entire chart reading.
MUST BE 100% ACCURATE to the running Dasha-Bhukti period (${dashaLine}) and live transit influences from the facts above.
Weigh the chart strengths against the challenges honestly, name the ONE primary life focus for the coming year, and close with genuine spiritual encouragement.
Do not list chapters again. Speak to them directly as 'you'.

${JSON_RULE}
{"summary":[{"impact":"two or three paragraphs"}]}`;

  return { characteristics, darkSecret, currentPhase, bhavishya, yogas, doshas, gochara, timeline, summary };
};
