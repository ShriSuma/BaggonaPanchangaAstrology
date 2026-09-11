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

  const darkSecret = input.ageYears < 8 ? "" : `${header(
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
    "You are an intuitive Vedic astrologer laying out a personalized 6-month journey map for " + input.name + "."
  )}
Engine roadmap for the coming months:
${roadmapText || "  (not available)"}

CRITICAL PERSONALIZATION REQUIREMENT:
Connect each month directly with ${input.name}'s living reality at age ${Math.floor(input.ageYears)}.
Provide EXACTLY SIX (6) entries in the 'timeline' array — one entry for EACH of the 6 months listed in the roadmap above.
For EACH month entry:
- 'dateRange': Write the month name and year in the target language native script (${input.lang}).
- 'impact': Write ONE generous, detailed paragraph (at least 4-5 sentences) detailing concrete, relatable events happening in their life during that month (financial expenses/relief, family conversations, workplace dynamics, wellness vigilance, or spiritual moments). Avoid vague jargon. Speak directly to 'you'.
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
  const isManglik = marsPlacement && [1, 4, 7, 8, 12].includes(marsPlacement.house);
  const venusPlacement = input.natalPlanets.find(p => p.graha === "Venus");
  const jupiterPlacement = input.natalPlanets.find(p => p.graha === "Jupiter");
  const saturnPlacement = input.natalPlanets.find(p => p.graha === "Saturn");

  const directionsByElement = ["East", "South", "West", "North", "East", "South", "West", "North", "East", "South", "West", "North"];
  const spouseDirection = directionsByElement[h7.signIdx] || "East";

  const shaniTransit = input.transits.find(t => t.graha === "Saturn");
  const guruTransit = input.transits.find(t => t.graha === "Jupiter");
  const isGuruBala = guruTransit && [2, 5, 7, 9, 11].includes(guruTransit.houseFromMoon);

  const isChild = input.ageYears < 8;

  const bhavishya = isChild ? `${header(
    input,
    "bhavishya",
    "You are a wise and compassionate Vedic astrologer specializing in child horoscopes, analyzing early intellectual development, education, activities, creative talents, health, and parental nurturing."
  )}
CRITICAL CHILD HOROSCOPE ACCURACY REQUIREMENT:
The native is a young child (${Math.floor(input.ageYears)} years old). DO NOT generate any adult marriage, romantic, or progeny predictions.
Instead, write deep astrological guidance for the child's development across these key areas:

1. Education & Early Intellect (Vidya & Buddhi):
   - 4th House (Vidya): ${getHouseInfo(4).sign} (Lord ${getHouseInfo(4).lordStr} ${getHouseInfo(4).lordWhere}). 5th House (Buddhi): ${h5.sign} (Lord ${h5.lordStr} ${h5.lordWhere}).
   - Mercury (Budha): ${input.natalPlanets.find(p => p.graha === "Mercury") ? `in Bhava ${input.natalPlanets.find(p => p.graha === "Mercury")!.house}` : "present"}. Jupiter (Guru): ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house}` : "present"}.
   - Write THREE detailed paragraphs detailing memory power, grasping capacity, academic inclination, intellectual focus, and optimal learning environment.

2. Talents, Activities & Sports (Kala, Kreeda & Kaushalya):
   - 3rd House (Parakrama): ${getHouseInfo(3).sign}. 5th House: ${h5.sign}. Mars: ${marsPlacement ? `in Bhava ${marsPlacement.house}` : "present"}. Venus: ${venusPlacement ? `in Bhava ${venusPlacement.house}` : "present"}.
   - Write TWO detailed paragraphs detailing extracurricular inclinations, sports, creative hobbies, artistic expressions, and active energy channeling.

3. Future Foundation & Character:
   - Write TWO detailed paragraphs on building strong moral character, leadership qualities, discipline, and noble values.

4. Family Environment & Upbringing:
   - Write TWO detailed paragraphs on family warmth, parental guidance, emotional security, and auspicious home atmosphere.

5. Health, Vitality & Pediatric Care (Bala Arogya):
   - 1st House (Lagna): ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}). 6th House: ${h6.sign}.
   - Write TWO detailed paragraphs on pediatric vitality, seasonal immunity care, balanced nutrition, and classical remedies for child health and longevity.

${JSON_RULE}
{"bhavishya":{"marriage":"three paragraphs for education and learning","children":"two paragraphs for activities and creativity","career":"two paragraphs for future foundation","wealth":"two paragraphs for family upbringing","health":"two paragraphs for pediatric health and immunity"}}`
  : `${header(
    input,
    "bhavishya",
    "You are an authoritative Vedic astrologer analyzing specific life areas based strictly on 7th house lord, 5th house lord, 10th house lord, and 2nd house lord."
  )}
CRITICAL PERSONALIZED ACCURACY REQUIREMENT:
Provide a 100% personalized astrological reading for the following 5 life categories based on this chart's exact computed placements:
- Native Age: ${Math.floor(input.ageYears)} years old, Gender: ${(input.gender || "Male").toUpperCase()}.
${input.ageYears >= 60 ? "- SENIOR CITIZEN (60+ YEARS): The native is a senior. Tailor all interpretations with deep emotional reverence for their life stage. Focus on lifelong spiritual companionship, domestic serenity, mutual health care, family legacy, joy from grandchildren, mentorship, and asset preservation. NEVER suggest wedding proposals, matchmaking, or seeking marriage alliances." : input.ageYears < 22 ? "- YOUTH / STUDENT (< 22 YEARS): The native is in their student/youth phase. Focus on higher education, college admissions, competitive exams, study discipline, character formation, avoiding premature distractions, and building professional foundations. NEVER suggest marriage timing or finding romantic partners." : "- ADULT (22-59 YEARS): Deliver deeply resonant, mature astrological readings strictly grounded in chart facts, career ascent, and family prosperity."}

1. Marriage & Relationships (User Selected Status: ${maritalSel.toUpperCase()}):
   - 7th House Sign: ${h7.sign}. 7th House Lord: ${h7.lordStr} is placed ${h7.lordWhere}.
   - Occupants of 7th House: ${h7.occStr}.
   - Native Gender: ${(input.gender || "Male").toUpperCase()}.
   - Karaka Placement: ${(input.gender || "Male") === "Female" ? `Jupiter (Jeevakaraka) is placed ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house} (${rashiName(jupiterPlacement.rashiIndex, lang)})` : "in chart"}, 8th House (Mangalya Sthana) is ${h8.sign} with lord ${h8.lordStr}` : `Venus (Shukrakaraka) is placed ${venusPlacement ? `in Bhava ${venusPlacement.house} (${rashiName(venusPlacement.rashiIndex, lang)})` : "in chart"}`}.
   - Kuja / Manglik Status: ${isManglik ? `Kuja Dosha indicated (Mars in Bhava ${marsPlacement?.house})` : "No Kuja Dosha (Mars is comfortably placed outside 1/4/7/8/12)"}.
   - Direction of Spouse Alignment: ${spouseDirection} direction from birthplace.
   - Vivaha Yoga & Transits: Running ${dashaLine}. Jupiter transit: ${guruTransit ? `${guruTransit.houseFromMoon} from Chandra (${isGuruBala ? "Guru Bala active" : "Guru testing"})` : "active"}. Saturn transit: ${shaniTransit ? `${shaniTransit.houseFromMoon} from Chandra` : "active"}.
   - CRITICAL RULE: MUST CONTAIN ONLY MARRIAGE & RELATIONSHIP CONTENT. DO NOT INCLUDE ANY CHILDREN OR PROGENY CONTENT IN THIS ITEM. IF USER SELECTED 'no_children', DO NOT MENTION RAISING CHILDREN, SCHOOLING, OR PARENTING. Focus purely on the deep emotional bond between the couple, mutual trust, and facing external questions as a united front.
   - ${maritalSel === "married"
       ? `Write EXACTLY THREE detailed paragraphs for MARRIED status:
         Paragraph 1: Grounded in 7th lord ${h7.lordStr} ${h7.lordWhere}, running ${dashaLine}, and transit influences. Analyze how these planets govern mutual trust, domestic stability, and emotional depth.
         Paragraph 2: Detailed psychological and practical dynamics of partnership—mutual respect in financial and household decisions, spouse's temperament reflecting ${h7.lordStr} and 7th house qualities, and shared milestones.${childrenSel === 'no_children' ? ' Focus on mutual emotional sanctuary and facing societal questions together.' : ''}
         Paragraph 3: Domestic peace, harmonizing occasional differences through empathetic communication, and targeted classical remedies (${isManglik ? "Subramanya / Mangala Pooja" : "Lakshmi-Narayana / Gauri-Shankara Pooja"}).`
       : maritalSel === "unmarried"
       ? `Write EXACTLY THREE detailed paragraphs for UNMARRIED status:
         Paragraph 1: Grounded in 7th lord ${h7.lordStr} ${h7.lordWhere}, running ${dashaLine}, and live transits (${guruTransit?.houseFromMoon}th house Guru, ${shaniTransit?.houseFromMoon}th house Shani). Calculate the exact Vivaha Yoga timing window and reasons for past delays.
         Paragraph 2: Spouse's characteristics, intellect, moral values, profession, and physical/emotional demeanor derived strictly from 7th house ${h7.sign} and lord ${h7.lordStr}, with arrival indicated from the ${spouseDirection} direction.
         Paragraph 3: Addressing any planetary friction (${isManglik ? "Kuja/Manglik remedy" : "planetary alignment"}), exact daily mantra ("Om Shreem Gauryai Namah" / "Om Saptamadhipataye Namah"), and auspicious alliance timing.`
       : `Write EXACTLY THREE detailed paragraphs for GENERAL status:
         Paragraph 1: Natal analysis of 7th house ${h7.sign}, lord ${h7.lordStr} ${h7.lordWhere}, and running ${dashaLine}.
         Paragraph 2: Relationship compatibility, emotional bonding, and practical partnerships.
         Paragraph 3: Remedies for harmony, mutual understanding, and relational longevity.`}

2. Children & Progeny (User Selected Status: ${childrenSel.toUpperCase()}):
   - 5th House Sign: ${h5.sign}. 5th House Lord: ${h5.lordStr} is placed ${h5.lordWhere}.
   - Occupants of 5th House: ${h5.occStr}.
   - Putrakaraka Jupiter (Guru): placed ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house} (${rashiName(jupiterPlacement.rashiIndex, lang)})` : "in chart"}.
   - Progeny Transit: Jupiter transit ${guruTransit?.houseFromMoon} from Chandra. Running ${dashaLine}.
   - ${childrenSel === "has_children"
       ? `Write EXACTLY TWO detailed paragraphs for HAS CHILDREN status:
         Paragraph 1: Detailed analysis of children's intellect, academic excellence, specialized talents, and moral character derived from 5th lord ${h5.lordStr} and Putrakaraka Jupiter.
         Paragraph 2: Parental guidance, children's future growth, family bonding, and spiritual blessings (Saraswati / Ganapati Atharvashirsha).`
       : childrenSel === "no_children"
       ? `Write EXACTLY THREE expansive, deeply empathetic paragraphs for SEEKING PROGENY status addressed to ${input.name}:
         Paragraph 1: Deep emotional validation of the quiet, unspoken longing and heartfelt prayers for a child. Analyze 5th house (Santana Bhava) ${h5.sign}, lord ${h5.lordStr} ${h5.lordWhere}, Putrakaraka Jupiter, and running ${dashaLine}. Emphasize that lineage continuity is preserved in their Poorva Punya.
         Paragraph 2: Astrological window and timing for conception based on Jupiter transit and supportive aspects. Reassure them with warmth that delays are periods of karmic refinement, not denial. Encourage standing united as an emotional anchor, combining medical consultations and balanced lifestyle.
         Paragraph 3: Sacred Baggona & Vedic remedies: Daily Santana Gopala Mantra ('Om Kleem Devakisuta Govinda Vasudeva Jagatpate, Dehi Me Tanayam Krishna Tvamaham Sharanam Gatah') 108 times, Thursday Gau-seva (cow ghee lamp and feeding cow), and Subrahmanya / Naga Shanti Pooja at Gokarna Mahabaleshwara / Baggona Kshetra.`
       : `Write EXACTLY TWO detailed paragraphs for GENERAL status:
         Paragraph 1: 5th house (Poorva Punya & Intellect) ${h5.sign}, lord ${h5.lordStr}, and Jupiter's influence on intellect and lineage.
         Paragraph 2: Creative achievements, intellectual legacy, and family blessings.`}

3. Career & Profession:
   - 10th House Sign: ${h10.sign}. 10th House Lord: ${h10.lordStr} is placed ${h10.lordWhere}.
   - Occupants of 10th House: ${h10.occStr}.
   - Karmakaraka Saturn (Shani): placed ${saturnPlacement ? `in Bhava ${saturnPlacement.house} (${rashiName(saturnPlacement.rashiIndex, lang)})` : "in chart"}.
   - Write TWO expansive paragraphs (minimum 5 to 6 full lines each, at least 75-90 words per paragraph) analyzing career stability, leadership prospects, professional growth, and timing of milestones under running ${dashaLine}.

4. Wealth & Family Finance:
   - 2nd House (Accumulated Wealth): ${h2.sign} (Lord ${h2.lordStr} ${h2.lordWhere}, occupants: ${h2.occStr}).
   - 11th House (Income & Gains): ${h11.sign} (Lord ${h11.lordStr} ${h11.lordWhere}, occupants: ${h11.occStr}).
   - Dhanakaraka Jupiter: ${jupiterPlacement ? `in Bhava ${jupiterPlacement.house}` : "present"}.
   - Write TWO expansive paragraphs (minimum 5 to 6 full lines each, at least 75-90 words per paragraph) on financial accumulation, investments, property gains, family prosperity, and wealth preservation.

5. Health & Vitality:
   - 1st House (Lagna / Physical Constitution): ${h1.sign} (Lord ${h1.lordStr} ${h1.lordWhere}).
   - 6th House (Roga Sthana): ${h6.sign} (Lord ${h6.lordStr} ${h6.lordWhere}).
   - Sun (Vitality) and Moon (Mental Equanimity) dignity in chart.
   - Write TWO expansive paragraphs (minimum 5 to 6 full lines each, at least 75-90 words per paragraph) on physical stamina, seasonal wellness precautions, emotional resilience, and Ayurvedic/spiritual remedies.

${JSON_RULE}
{"bhavishya":{"marriage":"three paragraphs","children":"${childrenSel === "no_children" ? "three paragraphs" : "two paragraphs"}","career":"two paragraphs","wealth":"two paragraphs","health":"two paragraphs"}}`;

  const summary = `${header(
    input,
    "summary",
    "You are a revered Vedic master astrologer closing the reading for " + input.name + ", synthesizing their chart with profound personal warmth, wisdom, and spiritual authority."
  )}
CRITICAL PERSONAL CONNECTION & SYNTHESIS REQUIREMENT:
Speak directly and intimately to ${input.name} as a caring spiritual mentor.
Do NOT write academic descriptions of astrological houses (such as listing Kendra or Trikona numbers) or generic textbook statements.
Write TWO TO THREE (2-3) DEEPLY PERSONAL AND INSPIRING PARAGRAPHS synthesizing their reading:
- Paragraph 1 (Personal Life Synthesis): Address ${input.name} directly. Synthesize their unique Lagna (${h1.sign}), Moon (${rashiName(input.moonRashiIndex, lang)}), and running ${dashaLine}. Acknowledge their past perseverance, validate their life's journey, and affirm their inner moral strength.
- Paragraph 2 (The Singular Priority for the Year Ahead): Given their age (${Math.floor(input.ageYears)}), life stage, and planetary weather, identify the ONE single most important life focus for the coming year (${input.ageYears >= 60 ? 'health vitality, peaceful contemplation, and harmonious family guidance' : input.ageYears < 23 ? 'disciplined educational focus, emotional resilience, and steady skill-building' : (maritalSel === 'married' && childrenSel === 'no_children' ? 'strengthening marital unity, patient prayers and healthy preparation for progeny, and steady financial stability' : 'strategic financial consolidation, emotional patience at home, and disciplined career focus')}).
- Paragraph 3 (Loving Spiritual Blessing): Close with an uplifting, compassionate blessing from the sacred tradition of Baggona Kshetra, inspiring ${input.name} to move forward with unshakeable faith, peace of mind, and divine protection.

${JSON_RULE}
{"summary":[{"impact":"two or three paragraphs"}]}`;

  return { characteristics, darkSecret, currentPhase, bhavishya, yogas, doshas, gochara, timeline, summary };
};
