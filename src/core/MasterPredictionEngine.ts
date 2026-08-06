import type { KundliOutput, PlanetName, AyanamsaModel } from "./AstroTypes";
import { generateJayashreePrediction, type JayashreePrediction } from "./JayashreePredictionEngine";
import { generateBVRamanPrediction, type BVRamanPrediction } from "./BVRamanPredictionEngine";
import { generateBaggonaPredictions, type BaggonaPredictions } from "./BaggonaPredictionEngine";
import { calculateTraditionalBaggona } from "./TraditionalBaggonaEngine";
import { findBhuktiAtAge } from "./DashaBhuktiEngine";
import { ageDecimalYearsAt } from "./birthTime";
import { evaluateNatalLayer, type NatalLayerOutput } from "./layers/NatalLayer";
import { evaluateTimingLayer, type TimingLayerOutput } from "./layers/TimingLayer";
import { inferLifeStatus } from "./StatusInferenceEngine";
import { getPariharas, type Parihara } from "./PariharaEngine";
import { getRandomShlokaForGraha, getRandomAashirvada, type Shloka } from "./ShlokaEngine";
import { translateTexts } from "../services/translationService";

export interface MasterPredictionResult {
  metadata: {
    name: string;
    birthDate: string;
    birthTime: string;
    currentAgeDecimal: number;
    runningMahadasha: string;
    runningBhukti: string;
  };
  natalLayer: NatalLayerOutput;       // Layer 1
  timingLayer: TimingLayerOutput;     // Layer 2
  bvRamanCore: BVRamanPrediction;
  jayashreeInsights: JayashreePrediction;
  baggonaTraditional: BaggonaPredictions;
  masterSynthesis: {                  // Layer 3
    priorityTopic: string;
    priorityMessage: string;
    mindfulRitual: string;
    career: string;
    finance: string;
    health: string;
    education: string;
    relationships: string;
    overallTone: string;
  };
  pariharas: Parihara[];
  shloka: Shloka;
  aashirvada: { sanskrit: string; meaning: string };
  aiGeneratedNarrative?: {
    characteristics?: string[];
    darkSecret?: string[];
    currentPhase?: string[];
    next6Months?: string[];
    roadmap?: {
      month: string;
      status: "Excellent" | "Good" | "Neutral" | "Challenging";
      prediction: string;
      auspiciousDates: string;
      activities: string;
    }[];
    bhavishya?: {
      health?: string[];
      marriage?: string[];
      children?: string[];
      career?: string[];
      wealth?: string[];
    };
    yogas?: { name: string; significance?: string | string[]; }[];
    doshas?: { name: string; significance?: string | string[]; remedy?: string }[];
    summary?: string;
    ashirvada?: string;
  };
}

export interface MasterEngineContext {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  latitude: number;
  longitude: number;
  gender?: "Male" | "Female" | "Other";
  isMarried?: boolean;
  hasChildren?: boolean;
  hasJob?: boolean;
  ayanamsaModel?: AyanamsaModel;
  lang?: string; // e.g., 'en', 'kn', 'te', 'ta', 'hi'
}

/**
 * Combines the precise, classical rules of Baggona Panchanga with the experiential rules 
 * of Jayashree and regional rules of Baggona into a single 3-Layered Master Engine.
 */
export async function generateMasterPrediction(
  kundli: KundliOutput,
  context: MasterEngineContext
): Promise<MasterPredictionResult> {
  
  // 1. Calculate Age and Current Dasha Period
  const ageDecimal = ageDecimalYearsAt(
    context.birthDate,
    context.birthTime,
    context.latitude,
    context.longitude,
    new Date()
  );
  
  const currentDasha = findBhuktiAtAge(kundli, ageDecimal);
  const mahaLord = currentDasha?.maha.planet;
  const bhuktiLord = currentDasha?.bhukti;

  const lang = context.lang || "en";

  // --- LAYER 1: NATAL LAYER (Janana Kundali) ---
  const natalLayer = evaluateNatalLayer(kundli, "en"); // Generate in English first

  // --- LAYER 2: TIMING LAYER (Dasha-Bhukti & Gochara) ---
  const timingLayer = evaluateTimingLayer(kundli, context); // English first

  // Traditional Core Engines
  const fallbackLord = kundli.planets[0].name; // usually Sun
  const bvRamanCore = generateBVRamanPrediction(
    kundli,
    mahaLord ?? fallbackLord,
    bhuktiLord ?? fallbackLord
  );

  const jayashreeInsights = await generateJayashreePrediction(
    kundli,
    context,
    lang
  );

  const tradBaggona = calculateTraditionalBaggona(
    context.birthDate,
    context.birthTime,
    context.latitude,
    context.longitude,
    context.ayanamsaModel ?? "lahiri"
  );
  
  const baggonaTraditional = generateBaggonaPredictions(
    kundli,
    tradBaggona,
    lang
  );

  // --- LAYER 3: SYNTHESIS & PRIORITY SCORING ---
  
  // Infer missing statuses using Baggona Panchanga algorithmic checks
  const inferredStatus = inferLifeStatus(kundli, ageDecimal);
  const isMarried = context.isMarried ?? !inferredStatus.isLikelyUnmarried;
  const hasJob = context.hasJob ?? !inferredStatus.isLikelyUnemployed;
  const hasChildren = context.hasChildren ?? !inferredStatus.isLikelyChildless;
  
  let priorityTopic = "Self Discovery";
  let priorityMessage = "At your current age, the planetary focus is on finding your true path and identity.";
  let mindfulRitual = "Take 10 minutes each morning to meditate on your core values. Write down one thing you are grateful for.";

  if (ageDecimal >= 22 && ageDecimal <= 60 && !hasJob) {
    priorityTopic = "Career & Employment";
    priorityMessage = `At age ${Math.floor(ageDecimal)}, establishing your career is the most critical missing milestone. Astrologically, the 10th house energies require immediate activation.`;
    mindfulRitual = "To balance your career energies, your ritual this week is to proactively connect with three people in your desired field without asking for a job, just advice.";
  } else if (ageDecimal >= 25 && ageDecimal <= 45 && !isMarried) {
    priorityTopic = "Marriage & Partnership";
    priorityMessage = `At age ${Math.floor(ageDecimal)}, securing a life partner is the primary focus. The 7th house energies indicate delays that can be overcome by shifting your approach to relationships.`;
    mindfulRitual = "To activate Venus/Jupiter for marriage, your ritual this week is to let go of one rigid expectation you have for a partner. Open yourself to unexpected connections.";
  } else if (isMarried && !hasChildren && ageDecimal >= 28 && ageDecimal <= 45) {
    priorityTopic = "Progeny & Family Expansion";
    priorityMessage = `The expansion of your family is heavily highlighted right now. Jupiter's transit is creating favorable conditions for growth.`;
    mindfulRitual = "Focus on nurturing energy. Spend time caring for plants, pets, or young family members to invoke the 5th house energies.";
  } else if (ageDecimal > 60) {
    priorityTopic = "Health & Spiritual Retirement";
    priorityMessage = `At this stage in your life, your chart emphasizes physical well-being and spiritual withdrawal.`;
    mindfulRitual = "Prioritize rest over obligation. Say 'no' to one stressful family demand this week and spend that time reading or walking in nature.";
  }

  const synthesize = (topic: string, jayaText: string, ramanYogas: typeof bvRamanCore.yogas) => {
    let result = jayaText;
    const relevantYogas = ramanYogas.filter(y => y.description.toLowerCase().includes(topic.toLowerCase()));
    if (relevantYogas.length > 0) {
      const yogaText = relevantYogas.map(y => y.name + ": " + y.description).join(" ");
      // Keep it simple for translation
      result += ` \n\nClassical combinations observed: ${yogaText}`;
    }
    return result;
  };

  const hasRajaYoga = bvRamanCore.yogas.some(y => y.name.includes("Raja") || y.name.includes("Dharma"));
  const hasDhanaYoga = bvRamanCore.yogas.some(y => y.name.includes("Dhana"));

  const masterSynthesis = {
    priorityTopic,
    priorityMessage,
    mindfulRitual,
    career: synthesize("career", jayashreeInsights.career, bvRamanCore.yogas) + (hasRajaYoga ? " This elevates professional status." : ""),
    finance: synthesize("wealth", jayashreeInsights.finance, bvRamanCore.yogas) + (hasDhanaYoga ? " You have classical wealth combinations." : ""),
    health: jayashreeInsights.health,
    education: jayashreeInsights.education,
    relationships: jayashreeInsights.housing,
    overallTone: bvRamanCore.dashaAnalysis + "\n" + bvRamanCore.gocharaAnalysis + "\n" + jayashreeInsights.intro
  };

  // --- DYNAMIC TRANSLATION FOR NEW PREMIUM LAYERS ---
  // If the user requested Telugu, Tamil, Kannada, or Hindi, we translate the English strings 
  // into simple language right here before returning them.
  if (lang !== "en") {
    // Gather all strings that need translation
    const stringsToTranslate = [
      natalLayer.shadowSelf.title,
      natalLayer.shadowSelf.description,
      natalLayer.shadowSelf.bluntTruth,
      natalLayer.karmicBaggage.title,
      natalLayer.karmicBaggage.description,
      natalLayer.karmicBaggage.soulPurpose,
      timingLayer.lifeClock.currentPhase,
      timingLayer.lifeClock.description,
      timingLayer.lifeClock.emotionalValidation,
      masterSynthesis.priorityTopic,
      masterSynthesis.priorityMessage,
      masterSynthesis.mindfulRitual,
      masterSynthesis.career,
      masterSynthesis.finance,
      masterSynthesis.overallTone
    ];

    // Gather roadmap strings
    const roadmapStrings = timingLayer.twelveMonthRoadmap.map(r => r.prediction);
    stringsToTranslate.push(...roadmapStrings);

    // Call LLM translation service (ensure prompt says "simple, non-complex language")
    // Note: The translationService internally handles the language.
    const translatedStrings = await translateTexts(stringsToTranslate, lang);

    // Re-assign translated strings
    let i = 0;
    natalLayer.shadowSelf.title = translatedStrings[i++] ?? natalLayer.shadowSelf.title;
    natalLayer.shadowSelf.description = translatedStrings[i++] ?? natalLayer.shadowSelf.description;
    natalLayer.shadowSelf.bluntTruth = translatedStrings[i++] ?? natalLayer.shadowSelf.bluntTruth;
    
    natalLayer.karmicBaggage.title = translatedStrings[i++] ?? natalLayer.karmicBaggage.title;
    natalLayer.karmicBaggage.description = translatedStrings[i++] ?? natalLayer.karmicBaggage.description;
    natalLayer.karmicBaggage.soulPurpose = translatedStrings[i++] ?? natalLayer.karmicBaggage.soulPurpose;
    
    timingLayer.lifeClock.currentPhase = translatedStrings[i++] ?? timingLayer.lifeClock.currentPhase;
    timingLayer.lifeClock.description = translatedStrings[i++] ?? timingLayer.lifeClock.description;
    timingLayer.lifeClock.emotionalValidation = translatedStrings[i++] ?? timingLayer.lifeClock.emotionalValidation;
    
    masterSynthesis.priorityTopic = translatedStrings[i++] ?? masterSynthesis.priorityTopic;
    masterSynthesis.priorityMessage = translatedStrings[i++] ?? masterSynthesis.priorityMessage;
    masterSynthesis.mindfulRitual = translatedStrings[i++] ?? masterSynthesis.mindfulRitual;
    masterSynthesis.career = translatedStrings[i++] ?? masterSynthesis.career;
    masterSynthesis.finance = translatedStrings[i++] ?? masterSynthesis.finance;
    masterSynthesis.overallTone = translatedStrings[i++] ?? masterSynthesis.overallTone;

    timingLayer.twelveMonthRoadmap.forEach(r => {
      r.prediction = translatedStrings[i++] ?? r.prediction;
    });
  }

  const pariharas = getPariharas(kundli);
  const shloka = getRandomShlokaForGraha(mahaLord ?? fallbackLord);
  const aashirvada = getRandomAashirvada();

  const aiGeneratedNarrative = {
    yogas: bvRamanCore.yogas.map(y => ({ name: y.name, significance: y.description })),
    doshas: bvRamanCore.doshas.map(d => ({ name: d.name, significance: d.description }))
  };

  return {
    metadata: {
      name: context.name,
      birthDate: context.birthDate,
      birthTime: context.birthTime,
      currentAgeDecimal: ageDecimal,
      runningMahadasha: mahaLord ?? "Unknown",
      runningBhukti: bhuktiLord ?? "Unknown"
    },
    natalLayer,
    timingLayer,
    bvRamanCore,
    jayashreeInsights,
    baggonaTraditional,
    masterSynthesis,
    pariharas,
    shloka,
    aashirvada,
    aiGeneratedNarrative
  };
}
