import { type KundliOutput, PlanetName } from "../AstroTypes";
import { MasterEngineContext } from "../MasterPredictionEngine";
import { findBhuktiAtAge } from "../DashaBhuktiEngine";
import { ageDecimalYearsAt } from "../birthTime";

export interface TimingLayerOutput {
  lifeClock: {
    currentPhase: string;
    description: string;
    emotionalValidation: string;
  };
  twelveMonthRoadmap: {
    month: string;
    prediction: string;
    isCritical: boolean;
  }[];
}

export function evaluateTimingLayer(kundli: KundliOutput, context: MasterEngineContext): TimingLayerOutput {
  return {
    lifeClock: calculateLifeClock(kundli, context),
    twelveMonthRoadmap: calculateTwelveMonthRoadmap(kundli, context)
  };
}

// ─── Life Clock: personalised based on Dasha lord, age, and key house lords ──
function calculateLifeClock(kundli: KundliOutput, context: MasterEngineContext): {
  currentPhase: string;
  description: string;
  emotionalValidation: string;
} {
  const now = new Date();
  const ageDecimal = ageDecimalYearsAt(
    context.birthDate,
    context.birthTime,
    context.latitude,
    context.longitude,
    now
  );

  const currentDasha = findBhuktiAtAge(kundli, ageDecimal);
  const mahaLord = currentDasha?.maha.planet ?? "Sun";
  const bhuktiLord = currentDasha?.bhukti ?? "Sun";

  const saturnH  = kundli.planets.find(p => p.name === PlanetName.Saturn)?.house ?? 0;
  const jupiterH = kundli.planets.find(p => p.name === PlanetName.Jupiter)?.house ?? 0;
  const rahuH    = kundli.planets.find(p => p.name === PlanetName.Rahu)?.house ?? 0;
  const marsH    = kundli.planets.find(p => p.name === PlanetName.Mars)?.house ?? 0;
  const moonH    = kundli.planets.find(p => p.name === PlanetName.Moon)?.house ?? 0;
  const sunH     = kundli.planets.find(p => p.name === PlanetName.Sun)?.house ?? 0;
  const venusH   = kundli.planets.find(p => p.name === PlanetName.Venus)?.house ?? 0;

  // Dasha-lord based phase names — each planet has a distinct archetypal period
  const dashaPhaseMap: Record<string, { phase: string; description: string; emotionalValidation: string }> = {
    Sun: {
      phase: "The Year of Solar Authority",
      description: `Sun Mahadasha activates your 10th and 1st house energies. The focus is squarely on your public standing, career identity, and relationship with authority — including your own. With Sun in the ${sunH}th house, this period challenges you to step into leadership or face the consequences of avoiding it.`,
      emotionalValidation: "You may feel unusually scrutinised right now — as if every action is being judged. This is the pressure of the Sun era: it demands authenticity. Stop performing strength and start embodying it. The recognition you crave is already being earned."
    },
    Moon: {
      phase: "The Lunar Inner Journey",
      description: `Moon Mahadasha places emotional intelligence at the centre of your life. Your Moon in the ${moonH}th house shapes how this period unfolds — highlighting family dynamics, emotional patterns from childhood, and your relationship with your own inner world. Domestic matters and mental health take priority.`,
      emotionalValidation: "You may feel more sensitive than usual, with old emotional memories surfacing. This is not weakness — it is your soul doing its deepest housekeeping. What needs healing is finally asking to be healed. Be gentle with yourself during this watery, reflective phase."
    },
    Mars: {
      phase: "The Mars Warrior Cycle",
      description: `Mars Mahadasha brings intensity, action, and often conflict. With Mars in the ${marsH}th house, this period accelerates ambition but also friction. You are being called to act decisively, defend your position, and channel your energy constructively. This is not a time for hesitation.`,
      emotionalValidation: "You may feel an unusual urgency or restlessness — as if life is moving too slowly for what you feel inside. Your body and spirit are revved at full throttle. The challenge is directing this fire productively rather than scattering it in anger or impulsive decisions."
    },
    Mercury: {
      phase: "The Mercurial Expansion",
      description: `Mercury Mahadasha activates your intellect, communication networks, and analytical abilities. This is a period of information gathering, learning, networking, and mental growth. Contracts, writing, teaching, and commerce are especially favoured. The mind is the dominant tool of this era.`,
      emotionalValidation: "Your mind is unusually busy right now — ideas, plans, and possibilities are multiplying faster than you can process them. This is Mercury asking you to refine your thinking, clarify your message, and choose depth over distraction."
    },
    Jupiter: {
      phase: "The Jupiter Expansion Era",
      description: `Jupiter Mahadasha is classically considered one of the most auspicious periods in the Vedic system. With Jupiter in the ${jupiterH}th house, this era expands whichever life area it touches — wisdom, wealth, children, spiritual growth, or higher learning. This is a time to think bigger.`,
      emotionalValidation: "You may sense that doors are opening — opportunities appearing that feel almost too good. Trust this. Jupiter's era is the universe expanding its investment in you. The key is not to let complacency creep in. Growth requires you to show up to meet the opportunity."
    },
    Venus: {
      phase: "The Venus Pleasure Cycle",
      description: `Venus Mahadasha is a period of refinement, beauty, relationships, and material comfort. With Venus in the ${venusH}th house, the emphasis falls on love, aesthetics, luxury, and social grace. This era tends to bring significant romantic or creative developments.`,
      emotionalValidation: "You may be craving beauty, connection, and comfort more than usual. This is Venus reminding you that pleasure is not a sin — it is a dimension of a full life. The risk of this era is over-indulgence or emotional dependency. The gift is learning to truly receive love."
    },
    Saturn: {
      phase: "The Shani Tapas Phase",
      description: `Saturn Mahadasha is the great teacher — relentless, slow, and transformative. With Saturn in the ${saturnH}th house, this era activates its lessons with particular intensity in that life area. Do not expect shortcuts. Saturn rewards sustained discipline, ethical action, and long-term thinking — nothing else.`,
      emotionalValidation: "This may feel like the hardest chapter of your life — and that is precisely the point. Saturn does not give you what you want; it gives you what you need. The weight you feel is not punishment — it is the pressure that produces diamonds. Your strength is being forged right now."
    },
    Rahu: {
      phase: "The Rahu Amplification Cycle",
      description: `Rahu Mahadasha is one of the most dramatic and unpredictable periods in the Vedic system. With Rahu in the ${rahuH}th house, this era amplifies the themes of that house to an almost overwhelming degree. New experiences, foreign influences, and radical change are hallmarks of this phase.`,
      emotionalValidation: "You may feel like you are living someone else's life — nothing feels familiar, and everything is accelerating beyond your comfort zone. This is Rahu's design: to pull you beyond your conditioning and into uncharted territory. Do not fight the intensity; learn to surf it."
    },
    Ketu: {
      phase: "The Ketu Liberation Phase",
      description: `Ketu Mahadasha is a period of spiritual introspection, withdrawal from the material world, and deep karmic resolution. It is common to feel detached from goals that once felt urgent. The soul is being called inward — toward solitude, wisdom, and surrender.`,
      emotionalValidation: "The world may feel unusually hollow right now — as if nothing satisfies you the way it once did. This is Ketu dissolving the illusions you have been living inside. You are not depressed; you are awakening. What you are losing needed to go."
    }
  };

  // Bhukti (sub-period) modifier
  const bhuktiModifiers: Record<string, string> = {
    Sun:     "The Sun sub-period adds a layer of ego challenges and authority themes to this phase.",
    Moon:    "The Moon sub-period brings emotional sensitivity and domestic matters to the foreground.",
    Mars:    "The Mars sub-period injects urgency, conflict, and decisive energy into this phase.",
    Mercury: "The Mercury sub-period accelerates communication, decisions, and learning opportunities.",
    Jupiter: "The Jupiter sub-period brings expansion, wisdom, and potential for growth.",
    Venus:   "The Venus sub-period adds romance, beauty, and social opportunities to this period.",
    Saturn:  "The Saturn sub-period layers additional responsibility, delay, or discipline onto this phase.",
    Rahu:    "The Rahu sub-period introduces unexpected changes, foreign influences, or unconventional developments.",
    Ketu:    "The Ketu sub-period heightens spiritual sensitivity and may bring sudden separations or losses."
  };

  // Age-based modifier for emotional validation
  let ageModifier = "";
  if (ageDecimal < 25) {
    ageModifier = " At your age, this planetary era is particularly formative — the patterns established now will echo through the decades ahead.";
  } else if (ageDecimal >= 25 && ageDecimal < 40) {
    ageModifier = " In your prime building years, this planetary era is asking you to make choices that align your outer ambitions with your inner truth.";
  } else if (ageDecimal >= 40 && ageDecimal < 60) {
    ageModifier = " At midlife, this planetary era arrives as a reckoning — old identities are dissolving to make room for the authentic self.";
  } else {
    ageModifier = " In the wisdom years, this planetary era calls for reflection, resolution, and the graceful passing of knowledge to those who follow.";
  }

  const phaseData = dashaPhaseMap[mahaLord] ?? {
    phase: `The ${mahaLord} Planetary Era`,
    description: `The ${mahaLord} Mahadasha shapes your current life chapter with its unique archetypal energy, influencing the specific areas of life governed by this planet in your birth chart.`,
    emotionalValidation: "You are in the midst of a significant planetary era. Trust the process, remain disciplined in your actions, and pay close attention to recurring themes in your life — they are the universe's direct communication with you."
  };

  const bhuktiModifier = bhuktiModifiers[bhuktiLord] ?? `The ${bhuktiLord} sub-period adds its own flavour to this phase.`;

  return {
    currentPhase: phaseData.phase,
    description: `${phaseData.description} ${bhuktiModifier}`,
    emotionalValidation: `${phaseData.emotionalValidation}${ageModifier}`
  };
}

// ─── 12-Month Roadmap: personalised by Dasha lord and planet placements ───────
function calculateTwelveMonthRoadmap(kundli: KundliOutput, context: MasterEngineContext): {
  month: string;
  prediction: string;
  isCritical: boolean;
}[] {
  const now = new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const ageDecimal = ageDecimalYearsAt(
    context.birthDate,
    context.birthTime,
    context.latitude,
    context.longitude,
    now
  );
  const currentDasha = findBhuktiAtAge(kundli, ageDecimal);
  const mahaLord = currentDasha?.maha.planet ?? "Sun";

  const saturnH  = kundli.planets.find(p => p.name === PlanetName.Saturn)?.house ?? 0;
  const jupiterH = kundli.planets.find(p => p.name === PlanetName.Jupiter)?.house ?? 0;
  const rahuH    = kundli.planets.find(p => p.name === PlanetName.Rahu)?.house ?? 0;
  const marsH    = kundli.planets.find(p => p.name === PlanetName.Mars)?.house ?? 0;
  const moonH    = kundli.planets.find(p => p.name === PlanetName.Moon)?.house ?? 0;

  // Prediction templates indexed by Dasha lord — each provides 12 distinct months of insight
  const roadmapTemplates: Record<string, string[]> = {
    Sun: [
      `The ${mahaLord} period opens with a focus on clarifying your professional identity. Decisions made now about your career direction will resonate for years.`,
      `Authority figures — bosses, parents, institutions — play a significant role this month. How you handle power dynamics will determine your position going forward.`,
      `A critical month for public reputation. Something becomes visible about your work or character. With Saturn in the ${saturnH}th house adding pressure, maintain integrity above all.`,
      `Creative energy peaks. Your confidence and personal magnetism are at a high point — use this to forge important connections or launch initiatives.`,
      `Mid-cycle review: the Sun period asks what you have built in terms of genuine substance versus appearances. Address any gap between the two.`,
      `Health and vitality require attention. The solar energy that drives ambition can also overheat the system. Rest and metabolic care are critical.`,
      `Financial clarity emerges. Review long-term investments and ensure your financial strategy aligns with your authentic career direction, not just short-term gain.`,
      `Relationships with authority figures shift — either you step into greater responsibility or you must confront someone above you. Either way, integrity wins.`,
      `A spiritually significant month. Unexpected insights about your life purpose arrive through stillness rather than activity.`,
      `Professional momentum builds. The groundwork laid in earlier months begins paying tangible dividends.`,
      `Family dynamics require attention — specifically your relationship with father figures or male authority in your lineage. Resolve lingering conflicts.`,
      `The year closes with a consolidation of your solar gains. Identify what truly served your growth and what drained your core energy.`
    ],
    Moon: [
      `Emotional sensitivity is heightened at the start of this lunar cycle. Pay close attention to your body's signals — especially sleep, digestion, and mood.`,
      `Family and domestic matters demand attention. With Moon in the ${moonH}th house, your inner home is being restructured.`,
      `A critical month for emotional processing. Something from the past resurfaces. Do not push it down — the Moon requires acknowledgment before release.`,
      `Intuition is exceptionally strong this month. Trust what you feel even when you cannot logically justify it.`,
      `Relationships with women — mothers, sisters, female colleagues — are in focus. Nurturing and being nurtured are both karmic priorities.`,
      `Your mental health and emotional balance require deliberate investment this month. Creative arts, water, and nature serve as healers.`,
      `A quieter, more reflective month. The Moon asks you to consolidate rather than expand. Inner work yields outer stability.`,
      `Financial matters connected to home or family property come into focus. Decisions made now have long-lasting domestic implications.`,
      `Emotional breakthroughs are possible. Old grief or resentment that has never been properly expressed finds a channel of release.`,
      `Social life and community connections become important. The Moon-period thrives in networks of genuine care, not superficial associations.`,
      `Spiritual and psychic sensitivity peaks. Dreams carry important messages. Keep a journal and watch for recurring symbols.`,
      `Closing month of the lunar cycle — integrate emotional wisdom gained through the year into your core identity going forward.`
    ],
    Mars: [
      `Mars opens this chapter with raw energy and urgency. A decision or action long delayed can no longer be postponed. Move decisively.`,
      `Conflict or competition emerges — with Mars in the ${marsH}th house, this arena is particularly heated. Choose your battles carefully but do not retreat unnecessarily.`,
      `This is the most critical action-month of the year. What you do now has disproportionate long-term consequences. Act with precision and courage.`,
      `Physical energy is at its peak. Athletics, adventure, and bold moves are supported. Channel Mars' fire into constructive output.`,
      `A month of confrontations — either external (conflict with others) or internal (confronting your own avoidance). Mars rewards the courageous.`,
      `Review your ambitions: are they truly yours, or were they imposed by fear or pressure? Mars-period success requires authentic drive.`,
      `Financial risks are present this month. Avoid reckless decisions driven by impatience. Mars' energy can destroy as easily as it builds.`,
      `Partnerships or alliances face stress-testing. Any relationship that is not built on mutual respect will show its fault lines now.`,
      `Health focus: Mars rules blood, muscles, and inflammation. Physical exercise and stress management are critical preventive measures.`,
      `A breakthrough month — sustained effort from earlier months culminates in a visible result. Mars rewards those who endured.`,
      `Spiritual implication of Mars period: your anger, competitiveness, and desire are being refined into courage, leadership, and righteous action.`,
      `Year-end consolidation: identify which of your battles were worth fighting and which drained energy that could have been directed toward creation.`
    ],
    Jupiter: [
      `Jupiter opens a year of genuine expansion. Opportunities that seemed out of reach become accessible — especially in fields connected to Jupiter in the ${jupiterH}th house.`,
      `Education, higher learning, and philosophical inquiry are activated. Pursue knowledge that truly enlarges your worldview.`,
      `A blessed month for marriages, partnerships, and legal matters. Jupiter's expansive energy protects and sanctifies agreements made now.`,
      `Children, creativity, and joy are in focus. If you have been suppressing your playful or creative side, Jupiter is restoring it.`,
      `Financial gains arrive — often through unexpected channels, gifts, or growth of investments. Be generous in proportion to your abundance.`,
      `Spiritual development accelerates. You may encounter a teacher, text, or experience that significantly shifts your philosophical foundation.`,
      `Critical month for long-term planning. Jupiter's vision is broad — use this window to draft plans that extend 5 to 10 years ahead.`,
      `Travel or exposure to foreign cultures brings meaningful insights. Even domestic travel yields philosophical enrichment.`,
      `A month of social recognition and reputational growth. Your contributions are being seen and acknowledged more widely.`,
      `Jupiter's period asks: are you giving back in proportion to what you have received? Service and generosity activate further blessings.`,
      `Deepening of wisdom — the superficial desires of earlier life feel less urgent, replaced by a genuine yearning for meaning.`,
      `Year-close integration: Jupiter asks you to identify the single most important belief upgrade of the past twelve months and anchor it as a new foundation.`
    ],
    Saturn: [
      `Saturn begins the year with a clear audit of your foundations. Where have you been cutting corners or avoiding hard work? That becomes the focal point.`,
      `Professional responsibilities increase — possibly through promotion or expanded duty. With Saturn in the ${saturnH}th house, this area demands sustained, serious effort.`,
      `This is the most demanding month of the year. Obstacles, delays, or health concerns may arise. Do not panic; Saturn tests endurance, not worthiness.`,
      `A month of structural review — relationships, finances, career infrastructure. Anything unstable will show its weakness now.`,
      `Discipline and routine are your greatest assets this month. The Saturn period rewards those who show up consistently, without complaint.`,
      `Karmic debts come due — financial, emotional, or social. Pay what you owe, apologise what needs apology. Saturn tracks every imbalance.`,
      `Health requires serious attention. Saturn rules bones, teeth, joints, and chronic conditions. Preventive care taken now prevents larger crises later.`,
      `A month of reduced social activity — Saturn pulls you inward toward solitude and reflection. Use it to strategise rather than socialise.`,
      `Spiritual deepening through hardship. The pressure of this period is refining your character in ways that easier times never could.`,
      `Progress becomes visible in areas where you have been consistently disciplined. Saturn's rewards are real, but they come on Saturn's timeline, not yours.`,
      `Relationship clarity: Saturn strips away politeness to reveal the actual nature of your bonds. Some connections are more obligation than love.`,
      `Year-end reckoning: Saturn asks you to honestly assess what you built, what you avoided, and what commitments you must honour going forward.`
    ],
    Rahu: [
      `Rahu launches this year with disorienting intensity. Old maps no longer work — you are in new territory without a guide. This is by design.`,
      `Foreign or unconventional influences enter your life with unusual force. Embrace what is new, but maintain your ethical grounding.`,
      `The most unpredictable month of the year. An unexpected development — career, relationship, or circumstance — reshapes your direction entirely.`,
      `A month of ambition and obsession — possibly unhealthy fixation on a goal or person. With Rahu in the ${rahuH}th house, this area is especially turbulent.`,
      `Illusions and self-deceptions are exposed this month. The story you have been telling yourself about your life is being challenged.`,
      `Technology, media, and unconventional strategies offer breakthroughs in career or communication. Think outside established frameworks.`,
      `Caution month: Rahu can amplify both extraordinary gains and extraordinary losses. Avoid reckless speculation in finance or relationships.`,
      `A month of social magnetism — you attract unusual people and situations. Discern carefully who and what serves your authentic evolution.`,
      `Spiritual disorientation is common in Rahu periods. Traditional practices may feel hollow. Seek genuine understanding over ritualistic comfort.`,
      `Breakthrough month: the chaos of earlier months begins crystallising into an unexpected and genuinely innovative direction.`,
      `Karmic acceleration — events unfold at unusual speed. What would normally take years compresses into weeks. Stay grounded.`,
      `Rahu's year concludes with a recalibration: you are not the same person who began this cycle. Honour what you have become.`
    ],
    Ketu: [
      `Ketu opens this year with a quiet but unmistakable pulling-inward. External achievements feel less urgent as spiritual and internal matters demand attention.`,
      `Detachment themes are strong — from possessions, relationships, or identities you have outgrown. Do not cling to what is leaving.`,
      `This month may bring a sense of loss or confusion. Something ends. Ketu's endings are always karmic completions — trust the release.`,
      `Psychic sensitivity is heightened. Dreams are vivid and significant. Meditation and silence are more productive than social activity.`,
      `Past-life themes and unresolved ancestral patterns surface. Work with a healer, therapist, or spiritual teacher who understands depth.`,
      `A month of unexpected clarity — as the material fog lifts, you see your life from an unusual angle of spiritual honesty.`,
      `Financial matters require a conservative, careful approach. Ketu periods can bring unexpected expenses through losses of what seemed secure.`,
      `Solitude is not loneliness this month — it is the necessary container for the profound inner work Ketu is performing.`,
      `A significant karmic encounter — a person from your past, or someone who carries a past-life resonance, enters your field.`,
      `Creative and spiritual gifts that have lain dormant begin awakening. Hidden talents are asking to be expressed.`,
      `The nearing end of this Ketu phase brings a profound readiness for re-engagement with life on different, more authentic terms.`,
      `Ketu concludes its work: you emerge lighter, less attached, and more genuinely yourself than when this cycle began.`
    ],
    Mercury: [
      `Mercury launches this year with a surge in mental activity and communication. Your words have unusual power — use them with precision.`,
      `Learning and skill acquisition are especially favoured. Invest in courses, certifications, or expertise that advances your core direction.`,
      `Contracts, negotiations, and agreements require careful review this month. Mercury-period deals can be brilliant or be riddled with overlooked details.`,
      `Siblings, cousins, or close neighbourhood connections play an unusual role in your life story this month.`,
      `A breakthrough in communication — you find the words for something you have been trying to express for years.`,
      `This month favours writing, publishing, teaching, and intellectual entrepreneurship. Your analytical gifts are at a premium.`,
      `Technology and systems thinking offer creative solutions. Audit your digital life and information habits for efficiency.`,
      `Mental fatigue may arise from Mercury's relentless pace. Schedule deliberate rest for the mind — nature, movement, and screen-free time.`,
      `Financial analysis and accounting receive focused attention. Mercury favours those who understand their numbers and manage detail precisely.`,
      `A month of social networking — connecting the right people creates unexpected opportunities in business or creative collaboration.`,
      `Education of a younger person — a student, child, or junior colleague — becomes a meaningful focus and a mirror for your own learning.`,
      `Mercury's year closes with a refined ability to think, communicate, and organise. Identify the most important insight gained and encode it into a new habit.`
    ],
    Venus: [
      `Venus opens this year with a deepening of desire — for beauty, love, comfort, and creative expression. Honour these longings consciously.`,
      `Romantic and social life become priority arenas. New connections made now carry artistic or karmic significance.`,
      `Financial flow through creative or aesthetic endeavours is especially strong. Beauty, design, art, and luxury sectors are favoured.`,
      `Relationship depth increases — superficial connections naturally fall away as you crave genuine emotional intimacy.`,
      `A month of creative breakthrough. If you have been building an artistic project, this is the month it finds its form.`,
      `Self-care and body appreciation take on spiritual significance. How you treat your own physical vessel reflects your relationship with pleasure itself.`,
      `Financial investments in beauty, wellness, fashion, or arts show strong returns this month.`,
      `Partnership dynamics shift — either deepening commitment or recognising misalignment. Venus demands authentic resonance, not convenient arrangement.`,
      `Social recognition through beauty, style, or artistic contribution brings unexpected opportunities.`,
      `A deeply romantic month — whether in existing love or the arrival of new connection. Venus is at full power in your chart this cycle.`,
      `Spiritual understanding of Venus: love is not merely personal preference — it is a cosmic force asking you to embody grace.`,
      `Venus closes its year with a refined sense of what you truly value — and what you were merely conditioned to desire.`
    ]
  };

  const templates = roadmapTemplates[mahaLord] ?? roadmapTemplates["Sun"];

  const roadmap = [];
  let m = now.getMonth();
  let y = now.getFullYear();

  for (let i = 0; i < 12; i++) {
    const prediction = templates[i] ?? `${months[m]} ${y}: The ${mahaLord} period continues its influence. Stay attuned to the themes of your current planetary era.`;
    roadmap.push({
      month: `${months[m]} ${y}`,
      prediction,
      isCritical: i === 2 || i === 8 // 3rd and 9th months tend to be pivot points
    });
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }
  return roadmap;
}
