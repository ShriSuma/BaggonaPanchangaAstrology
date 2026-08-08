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
  const roadmapText = input.roadmap
    .slice(0, 6)
    .map(r => `  ${r.month}: ${r.prediction}`)
    .join("\n");

  const characteristics = `${header(
    input,
    "characteristics",
    "You are a Vedic astrologer who has read this family's charts for thirty years and speaks plainly about what he sees."
  )}
Extra material for this chapter only:
Shadow side found by the engine: ${input.shadowSelf}
Karmic pattern found by the engine: ${input.karmicBaggage}

YOUR TASK
Write EXACTLY TWO paragraphs about who this person actually is.
Ground each claim in a specific placement from the chart facts above — name the graha, the rashi
or the bhava you are reading it from. A statement that could be said about anyone is a failure.
Be honest about the difficult side too: temper, secrecy, dependence on drink or gambling,
a habit of bending the truth, laziness, pride — but only where an affliction in the chart above
actually supports it. Say it as a caring elder would, not as an accusation.

${JSON_RULE}
{"characteristics":[{"impact":"paragraph one\\nparagraph two"}]}`;

  const darkSecret = `${header(
    input,
    "darkSecret",
    "You are an old astrologer revealing the one thing this chart hides. You speak quietly and you do not flatter."
  )}
Extra material for this chapter only:
Shadow: ${input.shadowSelf}
Karma: ${input.karmicBaggage}
${input.affairNote}

YOUR TASK
Reveal the single deepest hidden pattern of THIS chart — the niguda rahasya.
Paragraph one: the hidden pattern itself, tied to named placements from the facts above.
Paragraph two: how it shows up in ordinary daily life, and the lesson being asked of them.
Do not moralise, do not frighten, do not end on a warning. End on what can be healed.

${JSON_RULE}
{"darkSecret":[{"impact":"paragraph one\\nparagraph two"}]}`;

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
Extra material for this chapter only:
Remedies the engine already recommends: ${input.pariharas.join("; ") || "(none)"}

YOUR TASK
Give AT LEAST TWO doshas or serious karmic difficulties, drawn from the chart facts above.
For each: AT LEAST TWO paragraphs in 'impact' describing how it is actually felt in this
person's life, and a 'remedy' that is concrete and doable — a specific graha to propitiate,
a day of the week, a simple act of charity or a temple practice.
Prefer the engine's remedies where they fit. Never prescribe anything expensive or frightening.

${JSON_RULE}
{"doshas":[{"name":"name of the dosha","impact":"two or more paragraphs","remedy":"one clear remedy"}]}`;

  const gochara = `${header(
    input,
    "gochara",
    "You are an astrologer reading today's sky against this person's birth Moon."
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
Pick the three or four turning points in the next six months from the roadmap above.
For each, give a 'dateRange' and ONE long, generous paragraph of at least six sentences:
which graha causes the shift, what it opens, what it closes, what to attempt and what to postpone.
Be concrete about the area of life. Do not repeat the same advice in two entries.

${JSON_RULE}
{"timeline":[{"dateRange":"month range","impact":"one long detailed paragraph"}]}`;

  const summary = `${header(
    input,
    "summary",
    "You are the astrologer closing the book, speaking directly to the person in front of you."
  )}
YOUR TASK
Write two or three short paragraphs to finish the reading.
Weigh the strengths against the difficulties honestly, name the ONE thing that matters most
for this person in the coming year, and close with genuine encouragement.
Do not list the chapters again. Do not repeat sentences used earlier in the book.
Speak to them as 'you'.

${JSON_RULE}
{"summary":[{"impact":"two or three paragraphs"}]}`;

  return { characteristics, darkSecret, yogas, doshas, gochara, timeline, summary };
};
