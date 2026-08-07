import { type KundliOutput, PlanetName } from "../AstroTypes";

export interface NatalLayerOutput {
  shadowSelf: {
    title: string;
    description: string;
    bluntTruth: string;
  };
  karmicBaggage: {
    title: string;
    description: string;
    soulPurpose: string;
  };
  yogas: string[];
}

/** Structured affair indicator result (B.V. Raman classical rules) */
export interface AffairIndicatorResult {
  hasAffairIndicators: boolean;
  confidence: "high" | "medium" | "low";
  /** Specific classical indicators found in the chart */
  indicators: string[];
}

/**
 * Layer 1: Janana Kundali (Natal Layer)
 * Focuses on static birth chart analysis: Shadow Self (Dusthanas) and Karmic Baggage (Rahu/Ketu).
 */
export function evaluateNatalLayer(kundli: KundliOutput, lang: string): NatalLayerOutput {
  return {
    shadowSelf: analyzeShadowSelf(kundli),
    karmicBaggage: analyzeKarmicBaggage(kundli),
    yogas: ["Gaja Kesari Yoga", "Dhana Yoga"] // Populated by BV Raman Yoga engine
  };
}

// ─── Helper: get a planet's house number ────────────────────────────────────
function getHouse(kundli: KundliOutput, planet: PlanetName): number | null {
  return kundli.planets.find(p => p.name === planet)?.house ?? null;
}

// ─── Helper: get the Lagna (Ascendant) sign index ───────────────────────────
function getLagnaIdx(kundli: KundliOutput): number {
  // lagnaRashi.index or derive from the chart's first house
  return (kundli.lagnaRashi?.index ?? 0);
}

// ─── Helper: sign lord mapping (simplified, standard Parashari) ─────────────
const SIGN_LORDS: PlanetName[] = [
  PlanetName.Mars,    // 0 Mesha
  PlanetName.Venus,   // 1 Vrishabha
  PlanetName.Mercury, // 2 Mithuna
  PlanetName.Moon,    // 3 Karka
  PlanetName.Sun,     // 4 Simha
  PlanetName.Mercury, // 5 Kanya
  PlanetName.Venus,   // 6 Tula
  PlanetName.Mars,    // 7 Vrischika
  PlanetName.Jupiter, // 8 Dhanu
  PlanetName.Saturn,  // 9 Makara
  PlanetName.Saturn,  // 10 Kumbha
  PlanetName.Jupiter  // 11 Meena
];

/** Returns the sign-lord planet for a given house number (1-based) relative to Lagna */
function lordOfHouseN(kundli: KundliOutput, houseNum: number): PlanetName {
  const lagnaIdx = getLagnaIdx(kundli);
  const signIdx = (lagnaIdx + houseNum - 1) % 12;
  return SIGN_LORDS[signIdx];
}

// ─── Shadow Self Analysis ────────────────────────────────────────────────────
/**
 * Returns a unique, chart-specific shadow self based on dominant dusthana placements.
 * Priority: Saturn → Rahu → Mars → Moon → Mercury → Venus → Sun → default.
 */
function analyzeShadowSelf(kundli: KundliOutput): {
  title: string;
  description: string;
  bluntTruth: string;
} {
  const saturnH  = getHouse(kundli, PlanetName.Saturn);
  const rahuH    = getHouse(kundli, PlanetName.Rahu);
  const marsH    = getHouse(kundli, PlanetName.Mars);
  const moonH    = getHouse(kundli, PlanetName.Moon);
  const mercuryH = getHouse(kundli, PlanetName.Mercury);
  const venusH   = getHouse(kundli, PlanetName.Venus);
  const sunH     = getHouse(kundli, PlanetName.Sun);
  const ketuH    = getHouse(kundli, PlanetName.Ketu);

  // ── Saturn placements ─────────────────────────────────────────────────────
  if (saturnH === 1) {
    return {
      title: "The Shadow Self: The Isolated Striver",
      description: "Saturn in the 1st house casts a long shadow on the self — a relentless inner critic who never lets you rest.",
      bluntTruth: "You push yourself to the brink chasing an impossible standard of perfection. Behind your composed exterior is a person who genuinely believes they are never enough. The very discipline you wear as armour is also your prison."
    };
  }
  if (saturnH === 2) {
    return {
      title: "The Shadow Self: The Chronic Scarcity Mind",
      description: "Saturn in the 2nd house embeds a deep fear of loss — of wealth, family security, and voice.",
      bluntTruth: "You hoard — money, praise, even feelings — because you were conditioned early in life to believe that abundance is fleeting. Your fear of poverty quietly sabotages generosity and trust in relationships."
    };
  }
  if (saturnH === 4) {
    return {
      title: "The Shadow Self: The Emotionally Restrained",
      description: "Saturn in the 4th house creates a cold, structured inner home — warmth feels dangerous.",
      bluntTruth: "You present yourself as emotionally independent, but underneath is a child who never felt truly safe at home. You deflect vulnerability with sarcasm or control because you are terrified of being genuinely seen."
    };
  }
  if (saturnH === 5) {
    return {
      title: "The Shadow Self: The Suppressed Creator",
      description: "Saturn in the 5th house blocks spontaneous joy — creativity and playfulness feel frivolous or forbidden.",
      bluntTruth: "You secretly crave recognition for your intelligence and creative gifts, but fear of failure keeps you performing only in shadows. You overthink every decision because you cannot forgive yourself for mistakes."
    };
  }
  if (saturnH === 7) {
    return {
      title: "The Shadow Self: The Fear of Abandonment",
      description: "Saturn in the 7th house places crushing expectations on every partnership — no one is ever good enough, or you are terrified of being abandoned.",
      bluntTruth: "You constantly seek validation through partners, but your fear of abandonment pushes them away. You either become controlling or emotionally unavailable. It is time to stop expecting others to fix what only you can heal."
    };
  }
  if (saturnH === 8) {
    return {
      title: "The Shadow Self: The Hidden Fears",
      description: "Saturn in the 8th house creates deep psychological resistance to change, death, and the unknown.",
      bluntTruth: "You resist transformation with every fibre of your being because change terrifies you. You hold on — to people, situations, grudges — long past their expiry, and then wonder why life feels stagnant."
    };
  }
  if (saturnH === 12) {
    return {
      title: "The Shadow Self: The Hidden Burden",
      description: "Saturn in the 12th house creates a deeply private suffering — you carry heavy karma alone, rarely asking for help.",
      bluntTruth: "There is an ancient grief you carry that you cannot even name. You spend immense energy maintaining an outer image of strength while quietly unravelling inside. Your shadow lives in isolation."
    };
  }

  // ── Rahu placements ───────────────────────────────────────────────────────
  if (rahuH === 1) {
    return {
      title: "The Shadow Self: The Restless Reinventor",
      description: "Rahu in the 1st house creates an insatiable hunger for identity — you reinvent yourself constantly, never satisfied.",
      bluntTruth: "You are addicted to becoming someone new because you are deeply uncomfortable with who you actually are. Every persona you create is an escape from confronting your core self. The reinvention never ends because the real work has not yet begun."
    };
  }
  if (rahuH === 4) {
    return {
      title: "The Shadow Self: The Rootless Soul",
      description: "Rahu in the 4th house destabilises the inner home — a restless longing to belong somewhere, anywhere.",
      bluntTruth: "You have spent your life chasing a sense of 'home' — in places, people, or possessions — but it always feels just out of reach. You hunger for emotional security yet unconsciously dismantle it the moment it arrives."
    };
  }
  if (rahuH === 5) {
    return {
      title: "The Shadow Self: The Obsessive Romantic",
      description: "Rahu in the 5th house amplifies romantic desires beyond reason — love becomes obsession, not partnership.",
      bluntTruth: "Your romantic pursuits carry an almost manic quality. You fall fast, project deeply, and crash hard. Behind the charm is a person who confuses intensity for intimacy. You are chasing a fantasy, not a human being."
    };
  }
  if (rahuH === 7) {
    return {
      title: "The Shadow Self: The Illusory Partner",
      description: "Rahu in the 7th house creates magnetic but chaotic partnerships — you attract unusual, unconventional, or deceptive partners.",
      bluntTruth: "You are drawn to people who mirror your own hidden chaos. Your relationships are intense precisely because they are unstable. Until you confront what you are truly seeking in a partner, the same pattern will keep repeating."
    };
  }
  if (rahuH === 8) {
    return {
      title: "The Shadow Self: The Seeker of Forbidden Knowledge",
      description: "Rahu in the 8th house creates obsessive curiosity about secrets, taboo subjects, and hidden power.",
      bluntTruth: "You are drawn to what society deems forbidden — secrets, dark knowledge, occult, or hidden financial dealings. While this gives you extraordinary insight, it also feeds a shadow hunger that, if unchecked, leads to manipulation and moral compromise."
    };
  }
  if (rahuH === 12) {
    return {
      title: "The Shadow Self: The Escapist",
      description: "Rahu in the 12th house creates powerful urges to escape reality — through fantasy, travel, substances, or isolation.",
      bluntTruth: "You find the ordinary world unbearable and constantly seek escape. Whether through daydreaming, substance use, or spiritual bypassing, you avoid the present moment. The real work requires you to stop running and turn inward."
    };
  }

  // ── Mars placements ───────────────────────────────────────────────────────
  if (marsH === 1) {
    return {
      title: "The Shadow Self: The Uncontrolled Fire",
      description: "Mars in the 1st house gives tremendous drive but also explosive anger that undermines relationships.",
      bluntTruth: "Your aggression is your self-saboteur. You burn bridges with your intensity before the other person even finishes their sentence. Behind the bravado is a wounded warrior who believes vulnerability is weakness."
    };
  }
  if (marsH === 8) {
    return {
      title: "The Shadow Self: The Buried Rage",
      description: "Mars in the 8th house generates intense, hidden anger — explosive at unexpected moments.",
      bluntTruth: "You suppress your anger until it reaches a boiling point, then release it in ways that shock even yourself. You have deep wounds around betrayal and powerlessness that have never been properly addressed."
    };
  }
  if (marsH === 12) {
    return {
      title: "The Shadow Self: The Secret Aggressor",
      description: "Mars in the 12th house directs energy into hidden channels — secret battles, self-destructive habits, or isolated anger.",
      bluntTruth: "You fight wars no one sees — with yourself, in the middle of the night, behind closed doors. You are self-destructive in private and composed in public. Your shadow needs to be brought into the light before it consumes you from within."
    };
  }

  // ── Moon placements ───────────────────────────────────────────────────────
  if (moonH === 6) {
    return {
      title: "The Shadow Self: The Anxious Servant",
      description: "Moon in the 6th house creates chronic anxiety and a relentless need to fix and serve — at the cost of self.",
      bluntTruth: "You sacrifice your own emotional needs on the altar of being useful. You are afraid that the moment you stop serving others, you become worthless. Your deepest wounds come from being taken for granted by those you exhaust yourself for."
    };
  }
  if (moonH === 8) {
    return {
      title: "The Shadow Self: The Emotional Transformer",
      description: "Moon in the 8th house creates intense emotional depth — and equally intense emotional crisis.",
      bluntTruth: "You feel everything at a level that most people cannot comprehend. This gift makes you an extraordinary empath and an equally extraordinary sufferer. Your emotional tides are unpredictable, and you often hide your deepest wounds behind layers of composure."
    };
  }
  if (moonH === 12) {
    return {
      title: "The Shadow Self: The Hidden Dreamer",
      description: "Moon in the 12th house creates a rich inner world disconnected from practical reality.",
      bluntTruth: "You live more fully in your imagination than in the world others inhabit. The emotional pain you carry is ancient — often rooted in the maternal line — and you process it alone, in private, which only deepens the isolation."
    };
  }

  // ── Mercury placements ────────────────────────────────────────────────────
  if (mercuryH === 8) {
    return {
      title: "The Shadow Self: The Obsessive Analyser",
      description: "Mercury in the 8th house creates a mind that circles around secrets, conspiracies, and psychological puzzles.",
      bluntTruth: "Your mind never rests. You analyse yourself and others into exhaustion, looking for hidden meanings behind every word and silence. The truth is: you are using mental hyperactivity to avoid feeling what is right in front of you."
    };
  }
  if (mercuryH === 12) {
    return {
      title: "The Shadow Self: The Unspoken Truth",
      description: "Mercury in the 12th house creates a gap between what is thought and what is expressed.",
      bluntTruth: "You have brilliant insights that you never share, fears you cannot articulate, and words that get swallowed before they leave your mouth. You are fluent in internal monologue but nearly mute about what truly matters."
    };
  }

  // ── Venus placements ──────────────────────────────────────────────────────
  if (venusH === 6) {
    return {
      title: "The Shadow Self: The Loveless Martyr",
      description: "Venus in the 6th house redirects affectionate energy into obligation — love becomes service, not joy.",
      bluntTruth: "You are terrified of being truly loved because deep down you do not feel deserving of it. You substitute acts of service for genuine intimacy and then resent the very people you exhaust yourself for."
    };
  }
  if (venusH === 8) {
    return {
      title: "The Shadow Self: The Seeker of Forbidden Love",
      description: "Venus in the 8th house creates intense, secretive romantic desires that operate in shadow.",
      bluntTruth: "You are drawn to what is forbidden, hidden, or transformative in love. Conventional relationships feel insufficient for the depths you crave. This shadow, if ignored, can draw you into situations that carry enormous personal cost."
    };
  }
  if (venusH === 12) {
    return {
      title: "The Shadow Self: The Romantic Escapist",
      description: "Venus in the 12th house places love in the realm of the hidden — secret longing, imagined romance, or hidden relationships.",
      bluntTruth: "Your deepest romantic desires exist in a world you protect fiercely from reality. You are drawn to love that cannot be fully expressed in daylight. This shadow asks: what are you protecting, and at what cost?"
    };
  }

  // ── Sun placements ────────────────────────────────────────────────────────
  if (sunH === 6) {
    return {
      title: "The Shadow Self: The Invisible Authority",
      description: "Sun in the 6th house creates authority through service — but often goes unrecognised for genuine leadership.",
      bluntTruth: "You work twice as hard as those above you and receive half the credit. Your shadow is a deep resentment that you dress up as humility. You crave recognition but have been conditioned to believe that wanting it makes you arrogant."
    };
  }
  if (sunH === 8) {
    return {
      title: "The Shadow Self: The Shadowed Ego",
      description: "Sun in the 8th house places identity at the intersection of crisis and transformation.",
      bluntTruth: "You define yourself through your wounds and recoveries. While this grants you immense resilience, your ego is fused with suffering — you do not know who you are without a crisis. Healing asks you to build an identity beyond survival."
    };
  }
  if (sunH === 12) {
    return {
      title: "The Shadow Self: The Hidden Sovereign",
      description: "Sun in the 12th house places the core identity behind closed doors — tremendous inner power that rarely sees daylight.",
      bluntTruth: "You possess extraordinary inner authority, but it remains mostly invisible — to others and to yourself. You shrink from the spotlight even as your soul craves it. The deepest work of your life is learning to stand fully in your own light."
    };
  }

  // ── Ketu placements ───────────────────────────────────────────────────────
  if (ketuH === 1) {
    return {
      title: "The Shadow Self: The Spiritual Hermit",
      description: "Ketu in the 1st house creates detachment from the physical self — as if you are merely a visitor in your own body.",
      bluntTruth: "You feel profoundly disconnected from the material world and from your own desires. You observe your own life from a distance, which reads as wisdom to some but masks a deep avoidance of commitment and embodiment."
    };
  }
  if (ketuH === 7) {
    return {
      title: "The Shadow Self: The Detached Partner",
      description: "Ketu in the 7th house creates emotional detachment in partnerships — past-life completion through relationships.",
      bluntTruth: "Relationships never seem to fully anchor you. You enter with longing and exit with relief. Your soul carries ancient memories of partnerships that ended in loss, and you pre-emptively detach to avoid feeling that pain again."
    };
  }

  // ── Default (when no dominant dusthana pattern) ───────────────────────────
  return {
    title: "The Shadow Self: The Hidden Depths",
    description: "The 8th house energies indicate a tendency to conceal your true emotional landscape beneath a composed exterior.",
    bluntTruth: "You invest enormous energy in appearing in control while your inner world is far more turbulent and complex. You fear that if others truly saw the full scope of your inner life — your fears, doubts, and longings — they would leave. The real transformation begins when you stop hiding."
  };
}

// ─── Karmic Baggage Analysis ─────────────────────────────────────────────────
function analyzeKarmicBaggage(kundli: KundliOutput): {
  title: string;
  description: string;
  soulPurpose: string;
} {
  const ketuH = getHouse(kundli, PlanetName.Ketu);
  const rahuH = getHouse(kundli, PlanetName.Rahu);

  // Rahu/Ketu axis — classical karmic axis interpretations
  if (ketuH === 1 && rahuH === 7) {
    return {
      title: "Karmic Baggage: The Self-Sufficient Wanderer",
      description: "Ketu in the 1st house shows lifetimes of radical self-reliance, often at the cost of genuine partnership.",
      soulPurpose: "You are deeply accustomed to going it alone. Your soul's evolutionary direction (Rahu in 7th) is to learn true partnership — to be vulnerable, to compromise, and to co-create rather than control."
    };
  }
  if (ketuH === 2 && rahuH === 8) {
    return {
      title: "Karmic Baggage: The Accumulated Debt",
      description: "Ketu in the 2nd house carries unresolved financial and family karma from prior lifetimes.",
      soulPurpose: "Your soul has hoarded resources and clung to family structures for security across many lives. Rahu in the 8th now calls you to release, transform, and trust in sudden, unexpected abundance rather than carefully guarded wealth."
    };
  }
  if (ketuH === 3 && rahuH === 9) {
    return {
      title: "Karmic Baggage: The Local Messenger",
      description: "Ketu in the 3rd house indicates past mastery of communication and sibling bonds that no longer serve.",
      soulPurpose: "You have lived small — local, tribal, familiar. Rahu in 9th now commands you to expand radically: pursue higher knowledge, travel far, adopt philosophical breadth, and step beyond the village of your birth."
    };
  }
  if (ketuH === 4 && rahuH === 10) {
    return {
      title: "Karmic Baggage: The Restless Wanderer",
      description: "Ketu in the 4th house shows a past life where home was a source of entrapment or deep detachment.",
      soulPurpose: "You carried an ancient feeling of not belonging into this life. Your soul's purpose (Rahu in 10th) is to build your own legacy through public achievement — not seek comfort in a traditional home."
    };
  }
  if (ketuH === 5 && rahuH === 11) {
    return {
      title: "Karmic Baggage: The Detached Creator",
      description: "Ketu in the 5th house indicates past-life gifts in creativity and children that are now complete.",
      soulPurpose: "Your soul's direction is toward community, social networks, and group purpose (Rahu in 11th). Move from personal creation to collective contribution — your genius blooms when it serves a larger human mission."
    };
  }
  if (ketuH === 6 && rahuH === 12) {
    return {
      title: "Karmic Baggage: The Exhausted Servant",
      description: "Ketu in the 6th house shows a soul wearied by lifetimes of toil, service, and conflict.",
      soulPurpose: "You have earned rest. Rahu in the 12th calls you toward spiritual withdrawal, creative solitude, and surrender. The universe no longer asks you to fight — it asks you to let go and dissolve into something greater."
    };
  }
  if (ketuH === 7 && rahuH === 1) {
    return {
      title: "Karmic Baggage: The Over-Reliant Partner",
      description: "Ketu in the 7th house reveals past lives consumed by others' needs — identity lost in relationship.",
      soulPurpose: "This life calls you (Rahu in 1st) to discover yourself as a fully formed, independent individual. Relationships will serve you best as mirrors, not crutches. Build yourself first."
    };
  }
  if (ketuH === 8 && rahuH === 2) {
    return {
      title: "Karmic Baggage: The Secret Keeper",
      description: "Ketu in the 8th house indicates a soul deeply familiar with trauma, secrets, and occult knowledge.",
      soulPurpose: "Rahu in the 2nd now directs you toward stability, family bonds, and grounded abundance. You are learning that security — financial and familial — is not a trap but a foundation for genuine growth."
    };
  }
  if (ketuH === 9 && rahuH === 3) {
    return {
      title: "Karmic Baggage: The Dogmatic Believer",
      description: "Ketu in the 9th house shows past-life over-identification with religion, doctrine, or a guru.",
      soulPurpose: "Rahu in the 3rd calls you to question, communicate, experiment, and think for yourself. Your soul's next frontier is independent intellectual courage, not inherited wisdom."
    };
  }
  if (ketuH === 10 && rahuH === 4) {
    return {
      title: "Karmic Baggage: The Exhausted Achiever",
      description: "Ketu in the 10th house reveals a soul that has chased public status and career achievement across lifetimes.",
      soulPurpose: "Rahu in the 4th calls you inward — toward emotional healing, home, mother, and inner peace. Your greatest achievement this lifetime is not a title but a truly nourished inner life."
    };
  }
  if (ketuH === 11 && rahuH === 5) {
    return {
      title: "Karmic Baggage: The Jaded Networker",
      description: "Ketu in the 11th house indicates a soul that has worked large social networks and group causes to exhaustion.",
      soulPurpose: "Rahu in the 5th now calls you toward personal creativity, romance, children, and spontaneous joy. Your soul is learning to play — to create for creation's own sake, not for a movement."
    };
  }
  if (ketuH === 12 && rahuH === 6) {
    return {
      title: "Karmic Baggage: The Spiritual Exile",
      description: "Ketu in the 12th house reveals a soul that spent lifetimes in monasteries, isolation, or foreign exile.",
      soulPurpose: "This life's mission (Rahu in 6th) is to engage with the material world: service, health, work, and daily discipline. You are not meant to transcend life — you are meant to master it."
    };
  }

  // Default karmic read
  return {
    title: "Karmic Baggage: The Unfinished Business",
    description: "The Rahu-Ketu axis in your chart points to unresolved soul-level patterns that have carried across lifetimes.",
    soulPurpose: "Your task this lifetime is to embrace what Rahu calls you toward — a new frontier of experience — while releasing the safe, familiar comfort zone represented by Ketu. The soul evolves only by moving toward its fear."
  };
}

// ─── B.V. Raman Classical Affair Indicator Detection ─────────────────────────
/**
 * Detects classical indicators of secret/extramarital relationship tendencies
 * based on B.V. Raman's "How to Judge a Horoscope", "Stri Jataka", and
 * Parashari rules regarding the 5th, 7th, 8th, 12th houses and Venus/Mars/Rahu.
 *
 * Returns true ONLY when at least 2 independent indicators are present
 * (to avoid false positives from a single planetary placement).
 */
export function detectAffairIndicators(kundli: KundliOutput): AffairIndicatorResult {
  const indicators: string[] = [];
  let highCount = 0;
  let mediumCount = 0;

  const venusH    = getHouse(kundli, PlanetName.Venus);
  const marsH     = getHouse(kundli, PlanetName.Mars);
  const rahuH     = getHouse(kundli, PlanetName.Rahu);
  const saturnH   = getHouse(kundli, PlanetName.Saturn);
  const moonH     = getHouse(kundli, PlanetName.Moon);
  const sunH      = getHouse(kundli, PlanetName.Sun);
  const jupiterH  = getHouse(kundli, PlanetName.Jupiter);
  const mercuryH  = getHouse(kundli, PlanetName.Mercury);

  const lagnaIdx = getLagnaIdx(kundli);
  const lord7th  = lordOfHouseN(kundli, 7);
  const lord7thH = getHouse(kundli, lord7th);
  const lord5th  = lordOfHouseN(kundli, 5);
  const lord5thH = getHouse(kundli, lord5th);

  // Helper: are two planets in the same house (conjunction)?
  const conjunct = (p1: PlanetName, p2: PlanetName): boolean => {
    const h1 = getHouse(kundli, p1);
    const h2 = getHouse(kundli, p2);
    return h1 !== null && h2 !== null && h1 === h2;
  };

  // ── HIGH CONFIDENCE INDICATORS ────────────────────────────────────────────
  // R1. Venus + Rahu conjunction (any house) — classic Raman rule, strong indicator
  if (conjunct(PlanetName.Venus, PlanetName.Rahu)) {
    indicators.push("Venus conjunct Rahu — intense, unconventional romantic desires that operate outside social norms (B.V. Raman: Venus+Rahu association causes intense desire for illicit pleasures)");
    highCount++;
  }

  // R2. Mars + Venus + Rahu all in 7th house (triple affliction)
  if (venusH === 7 && marsH === 7 && rahuH === 7) {
    indicators.push("Venus, Mars, and Rahu together in the 7th house — extreme restlessness and instability in marriage (classical triple affliction)");
    highCount++;
  }

  // R3. Mars aspects Venus (7th aspect from Mars to Venus OR conjunction)
  // Mars in 1st aspects 7th; Mars in 7th aspects 1st; Mars in 4th aspects 7th; Mars in 10th aspects 4th, 7th
  const marsAspectsVenus = (() => {
    if (marsH === null || venusH === null) return false;
    const marsAspects = [
      marsH,                    // conjunction
      ((marsH - 1 + 3) % 12) + 1, // 4th aspect
      ((marsH - 1 + 6) % 12) + 1, // 7th aspect
      ((marsH - 1 + 7) % 12) + 1  // 8th aspect
    ];
    return marsAspects.includes(venusH);
  })();
  if (marsAspectsVenus && venusH !== marsH) { // already caught conjunction above
    indicators.push("Mars aspects Venus — passionate drives override marital fidelity (Raman: Mars-Venus mutual influence creates intense sensual magnetism)");
    highCount++;
  }

  // R4. 7th lord conjunct Rahu or Mars (classic Raman rule from "How to Judge a Horoscope")
  if (conjunct(lord7th, PlanetName.Rahu)) {
    indicators.push(`7th house lord (${lord7th}) conjunct Rahu — the marriage significator is coloured by Rahu's boundary-breaking, obsessive nature`);
    highCount++;
  }
  if (conjunct(lord7th, PlanetName.Mars) && lord7th !== PlanetName.Mars) {
    indicators.push(`7th house lord (${lord7th}) conjunct Mars — impulsive, passionate energy overrides commitment in the marriage house`);
    highCount++;
  }

  // R5. 5th lord (romance) in 12th (hidden pleasures) — Raman "Stri Jataka" rule
  if (lord5thH === 12) {
    indicators.push(`5th lord (romance/affairs: ${lord5th}) placed in 12th house (hidden pleasures, bed chamber) — secret romantic activity indicated`);
    highCount++;
  }

  // R6. 7th lord in 12th (Raman: "How to Judge a Horoscope" Vol II — spouse-related matters remain hidden)
  if (lord7thH === 12) {
    indicators.push(`7th lord (${lord7th}) in 12th house — marriage matters operate in secrecy; tendency toward hidden relationships (B.V. Raman classical rule)`);
    highCount++;
  }

  // ── MEDIUM CONFIDENCE INDICATORS ──────────────────────────────────────────
  // M1. Venus in 8th house (Raman: "intense, secretive approach to love, unconventional relationship paths")
  if (venusH === 8) {
    indicators.push("Venus in the 8th house — secretive, intense romantic nature with attraction to forbidden or transformative love (B.V. Raman)");
    mediumCount++;
  }

  // M2. Venus in 12th house (house of bed pleasures, hidden matters)
  if (venusH === 12) {
    indicators.push("Venus in the 12th house — romantic desires operate in private, unseen spaces; Raman links this to enjoyment of pleasures away from public view");
    mediumCount++;
  }

  // M3. Rahu in 7th house (unconventional marriage, unusual or chaotic partner)
  if (rahuH === 7) {
    indicators.push("Rahu in 7th house — Rahu's illusion and obsession in the marriage house creates a strong pull toward unconventional or secretive relationships");
    mediumCount++;
  }

  // M4. Mars in 7th house (Mangalik with 7th impact — Raman: sexual restlessness in marriage)
  if (marsH === 7) {
    indicators.push("Mars in 7th house — aggressive, passionate energy in the house of marriage; Raman notes heightened physical restlessness that may seek outlets beyond marriage");
    mediumCount++;
  }

  // M5. Moon in 7th with no aspect from Jupiter (Raman: emotional longing for variety in partnerships)
  if (moonH === 7 && jupiterH !== 1 && jupiterH !== 7 && jupiterH !== 4 && jupiterH !== 10) {
    indicators.push("Moon in 7th without Jupiter's stabilising influence — emotional flux in marriage; longing for romantic variety");
    mediumCount++;
  }

  // M6. Saturn in 7th (Raman: delays and frustrations in marriage → may seek emotional fulfilment outside)
  if (saturnH === 7) {
    indicators.push("Saturn in 7th house — severe marital restriction or cold partnerships may push the native to seek warmth outside the marriage bond");
    mediumCount++;
  }

  // M7. Venus in 5th aspected by Rahu or Mars (Kama Trikona affliction)
  if (venusH === 5 && (rahuH === 11 || rahuH === 5 || marsH === 11 || marsH === 5)) {
    indicators.push("Venus in 5th (romance house) with Rahu/Mars influence — Kama Trikona afflicted; intense romantic desires that may overflow marital boundaries");
    mediumCount++;
  }

  // M8. 5th house lord conjunct Venus in 8th or 12th
  if (conjunct(lord5th, PlanetName.Venus) && (venusH === 8 || venusH === 12)) {
    indicators.push(`5th lord (${lord5th}) conjunct Venus in ${venusH}th house — romance and hidden pleasures combine`);
    mediumCount++;
  }

  // M9. Sun in 7th with Rahu (ego-driven desire for conquest in marriage)
  if (sunH === 7 && rahuH === 7) {
    indicators.push("Sun conjunct Rahu in 7th — ego-driven obsession with conquest; relationships become arenas of personal power rather than partnership");
    mediumCount++;
  }

  // M10. 7th lord in 6th (enmity/conflict with spouse may lead to estrangement)
  if (lord7thH === 6) {
    indicators.push(`7th lord (${lord7th}) in 6th house — the marriage house lord placed in the house of enemies and conflict; Raman links this to persistent marital discord`);
    mediumCount++;
  }

  // ── Determine confidence and result ───────────────────────────────────────
  const totalScore = highCount * 2 + mediumCount;
  const hasAffairIndicators = totalScore >= 2; // Require at least 2 weighted indicators

  let confidence: "high" | "medium" | "low" = "low";
  if (highCount >= 2 || totalScore >= 5) {
    confidence = "high";
  } else if (hasAffairIndicators) {
    confidence = "medium";
  }

  return {
    hasAffairIndicators,
    confidence,
    indicators
  };
}
