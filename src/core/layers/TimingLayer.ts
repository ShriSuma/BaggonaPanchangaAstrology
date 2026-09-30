import { type KundliOutput, PlanetName } from "../AstroTypes";
import { MasterEngineContext } from "../MasterPredictionEngine";
import { findBhuktiAtAge } from "../DashaBhuktiEngine";
import { ageDecimalYearsAt } from "../birthTime";
import { getTransitsForDate } from "../BaggonaPredictionEngine";

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

  const saturnH  = kundli.planets.find(p => p.name === PlanetName.Saturn)?.house ?? 0;
  const jupiterH = kundli.planets.find(p => p.name === PlanetName.Jupiter)?.house ?? 0;
  const rahuH    = kundli.planets.find(p => p.name === PlanetName.Rahu)?.house ?? 0;
  const marsH    = kundli.planets.find(p => p.name === PlanetName.Mars)?.house ?? 0;
  const moonH    = kundli.planets.find(p => p.name === PlanetName.Moon)?.house ?? 0;
  const venusH   = kundli.planets.find(p => p.name === PlanetName.Venus)?.house ?? 0;
  const sunH     = kundli.planets.find(p => p.name === PlanetName.Sun)?.house ?? 0;
  const mercuryH = kundli.planets.find(p => p.name === PlanetName.Mercury)?.house ?? 0;
  const ascRashi = kundli.lagnaRashi?.english ?? "Mesha";
  const moonRashi = kundli.moonSign?.english ?? "Karka";
  const moonSignIdx = kundli.moonSign?.index ?? 0;

  const roadmap = [];
  let m = now.getMonth();
  let y = now.getFullYear();

  for (let i = 0; i < 12; i++) {
    const targetDate = new Date(y, m, 15);
    const ageDecimal = ageDecimalYearsAt(
      context.birthDate,
      context.birthTime,
      context.latitude,
      context.longitude,
      targetDate
    );
    const dashaAtMonth = findBhuktiAtAge(kundli, ageDecimal);
    const mahaLord = dashaAtMonth?.maha.planet ?? "Sun";
    const bhuktiLord = dashaAtMonth?.bhukti ?? "Jupiter";

    const transits = getTransitsForDate(moonSignIdx, targetDate, context.ayanamsaModel ?? "lahiri");
    const sunTransitH = transits[PlanetName.Sun]?.house ?? 1;
    const jupTransitH = transits[PlanetName.Jupiter]?.house ?? 1;
    const satTransitH = transits[PlanetName.Saturn]?.house ?? 1;
    const marsTransitH = transits[PlanetName.Mars]?.house ?? 1;
    const rahuTransitH = transits[PlanetName.Rahu]?.house ?? 1;

    let prediction = "";
    switch (i % 6) {
      case 0:
        prediction = `The month opens with a decisive surge in vitality and self-direction under running ${mahaLord} Mahadasha and ${bhuktiLord} Bhukti. With the Sun transiting the ${sunTransitH}th house from your Janma Chandra (${moonRashi}) and Lagna (${ascRashi}), personal initiatives and career visibility come to the forefront. Natal Saturn in house ${saturnH} cautions against hasty shortcuts, encouraging you to anchor your professional ambitions in disciplined execution.`;
        break;
      case 1:
        prediction = `Financial calibration, savings, and domestic stability define this period. Jupiter transiting house ${jupTransitH} from Chandra ${[2, 5, 7, 9, 11].includes(jupTransitH) ? "showers auspicious Guru Bala upon your wealth accumulation and family negotiations" : "advises a conservative, calculated approach toward household budgeting"}. Natal Jupiter in house ${jupiterH} supports judicious resource allocation and fruitful discussions regarding long-term property or security.`;
        break;
      case 2:
        prediction = `Energy, resolve, and overcoming competitive obstacles take priority as Mars moves through the ${marsTransitH}th house from Chandra. Supported by the ${bhuktiLord} sub-period, longstanding workplace bottlenecks dissolve through decisive action. With natal Mars placed in house ${marsH}, channel your drive constructively into physical fitness and complex projects while avoiding unnecessary verbal friction.`;
        break;
      case 3:
        prediction = `Partnership dynamics, domestic harmony, and shared commitments take center stage. With natal Venus situated in house ${venusH} and key transits illuminating your relational axis, open dialogue fosters mutual empathy and resolves prior misunderstandings. Collaborative teamwork and honoring your spouse's or partners' perspectives create profound emotional and practical stability.`;
        break;
      case 4:
        prediction = `Intellectual clarity, creative breakthroughs, and dharmic growth flourish under this planetary phase. The combined synergy of ${mahaLord}-${bhuktiLord} stimulates strategic foresight, higher learning, and intuitive problem-solving. Natal Mercury in house ${mercuryH} enhances negotiations and scholastic endeavors, while spiritual introspection brings peace of mind.`;
        break;
      case 5:
      default:
        prediction = `A pivotal consolidation month for vocational standing, executive responsibilities, and long-term milestones. Karmakaraka Saturn's transit in the ${satTransitH}th house from Chandra tests and rewards your professional endurance. Diligent efforts made over preceding months yield tangible recognition, solidifying your leadership reputation and opening reliable future pathways.`;
        break;
    }

    const isCritical = i === 2 || i === 5 || i === 8 || [1, 8, 12].includes(satTransitH) || sunTransitH === 10;

    roadmap.push({
      month: `${months[m]} ${y}`,
      prediction,
      isCritical
    });

    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }

  return roadmap;
}

