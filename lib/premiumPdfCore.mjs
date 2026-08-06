import { callGemini, callOpenAI } from "./kundliNarrativeCore.mjs";

const LANG_NAMES = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
  te: "Telugu",
  ta: "Tamil"
};

async function generateSection(prompt, env, schemaDesc) {
  let raw = "";
  if (env.GEMINI_API_KEY || env.GOOGLE_GEMINI_API_KEY) {
    raw = await callGemini(prompt, env.GEMINI_API_KEY || env.GOOGLE_GEMINI_API_KEY, env.GEMINI_MODEL);
  } else if (env.OPENAI_API_KEY) {
    raw = await callOpenAI(prompt, env.OPENAI_API_KEY, env.OPENAI_MODEL);
  } else {
    throw new Error("No AI API keys configured");
  }

  try {
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse JSON for prompt:", prompt);
    console.error("Raw response:", raw);
    throw new Error(`AI response was not valid JSON matching schema: ${schemaDesc}`);
  }
}

export async function generatePremiumPDFNarrative(prediction, lang, env = process.env) {
  const langName = LANG_NAMES[String(lang).split("-")[0]] ?? "English";
  const basePrompt = `You are an elite, highly empathetic Vedic Astrologer using the rules of Baggona Panchanga. Write your response ONLY in ${langName}. 
CRITICAL RULES:
1. Do NOT use ANY English words if the language is ${langName}. Never output words like "Impact", "Example", or "Remedy" in English.
2. Use VERY SIMPLE, everyday conversational words. DO NOT use heavy, complex, or difficult Sanskrit words (e.g., avoid words like "parishrama" or complex shlokas, use simple local equivalents).
3. DO NOT mention "Baggona Panchanga". You must refer to the astrological science as "Baggona Panchanga" or "Baggona Panchangada prakara".
4. You MUST return ONLY valid JSON with no markdown formatting around it.`;

  const p0_characteristics = `${basePrompt}
Topic: Characteristics of the Person (Vyaktitva / Guna-lakshana)
Data: 
- Core Personality: ${prediction.natalLayer?.corePersonality?.description}
- Mind & Emotional State: ${prediction.natalLayer?.mindAndEmotions?.description}
- Ascendant Lord Placement: ${prediction.natalLayer?.ascendantLordPlacement?.description}

Task:
Write EXACTLY 2 paragraphs (or bullet points) explaining the deep personality traits, behavior, and true nature of the person based on the above data.
Format required: { "characteristics": ["point/para 1", "point/para 2"] }`;

  const p0_darkSecret = `${basePrompt}
Topic: The Dark Secret / Hidden Flaws (Nigoodha Satya / Rahasya)
Data: 
- Shadow Self & Karmic Baggage: ${prediction.natalLayer?.shadowSelf?.description}

Task:
Write EXACTLY 2 paragraphs exposing the darkest secret, hidden flaws, or karmic baggage of this person. Be deep and mystical.
Format required: { "darkSecret": ["para 1", "para 2"] }`;

  const p1 = `${basePrompt}
Topic: Current Life Phase (Prasthutha Manasthiti mattu Jeevana)
Data: 
- Current Dasha & Phase: ${prediction.metadata?.runningMahadasha} - ${prediction.metadata?.runningBhukti}

Task:
Write EXACTLY 4 paragraphs explaining their "Prasthutha Manasthiti mattu Jeevana" (Current Life Phase and Mindset) based on their current Dasha/Bhukti.
Format required: { "currentPhase": ["para 1", "para 2", "para 3", "para 4"] }`;

  const p2 = `${basePrompt}
Topic: Next 6 to 12 Months Prediction & 12-Month Roadmap
Data:
- Roadmap Data: ${JSON.stringify(prediction.timingLayer?.twelveMonthRoadmap)}

Task: 
1. "next6Months": Write EXACTLY 3 paragraphs explaining their overall predictions for the next 6 to 12 months.
2. "roadmap": Translate the provided 12-month data into exactly 12 translated items. Ensure the month names and status are fully translated to ${langName}.
Format required: { 
  "next6Months": ["para 1", "para 2", "para 3"],
  "roadmap": [ { "month": "Month Year", "status": "Good/Neutral/Excellent", "prediction": "Translated prediction...", "auspiciousDates": "...", "activities": "..." } ] 
}`;

  const p3 = `${basePrompt}
Topic: Bhavishya (Detailed Future Predictions for Specific Life Areas)
Data:
- Primary Focus: ${prediction.masterSynthesis?.priorityTopic}

Task: Write detailed predictions for the following 5 life areas. For EACH area, you MUST write EXACTLY 2 paragraphs.
1. Arogya (Health)
2. Maduve mattu Sambandha (Marriage and Relationships)
3. Makkalu mattu Santati (Children and Progeny)
4. Udyoga (Career and Profession)
5. Kutumba mattu Sampattu (Family and Wealth)
Format required: {
  "health": ["para 1", "para 2"],
  "marriage": ["para 1", "para 2"],
  "children": ["para 1", "para 2"],
  "career": ["para 1", "para 2"],
  "wealth": ["para 1", "para 2"]
}`;

  const p4_karmic = `${basePrompt}
Topic: Yogas and Doshas (Karmic Gifts & Flaws)
Data:
- Yogas: ${JSON.stringify(prediction.aiGeneratedNarrative?.yogas || [])}
- Doshas/Pariharas: ${JSON.stringify(prediction.aiGeneratedNarrative?.doshas || [])}

Task: 
1. "yogas": For EACH Yoga, write EXACTLY 2 paragraphs (paragraph 1 explains what it does, paragraph 2 is a scenario example).
2. "doshas": For EACH Dosha, write EXACTLY 2 paragraphs (paragraph 1 explains what it does, paragraph 2 is a scenario example), and also provide a remedy.
Ensure everything is fully translated to ${langName}.
Format required: {
  "yogas": [ { "name": "...", "significance": ["...", "..."] } ],
  "doshas": [ { "name": "...", "significance": ["...", "..."], "remedy": "..." } ]
}`;

  const p5_summary = `${basePrompt}
Topic: Overall Summary & Astrologer's Blessing (Ashirvada Vachan)
Task: 
1. "summary": Write exactly 1 paragraph summarizing their entire life prediction in a single shot.
2. "ashirvada": Write a beautiful, deeply spiritual 1-paragraph astrologer's blessing (Ashirvada Vachan) for their future.
Ensure everything is fully translated to ${langName}.
Format required: {
  "summary": "One paragraph summarizing everything...",
  "ashirvada": "One paragraph of spiritual blessing..."
}`;

  const [charPart, secretPart, part1, part2, part3, part4, part5] = await Promise.all([
    generateSection(p0_characteristics, env, "Characteristics"),
    generateSection(p0_darkSecret, env, "Dark Secret"),
    generateSection(p1, env, "Current Phase"),
    generateSection(p2, env, "Timeline & 6-12 Months"),
    generateSection(p3, env, "Bhavishya Life Areas"),
    generateSection(p4_karmic, env, "Yogas & Doshas"),
    generateSection(p5_summary, env, "Summary & Ashirvada")
  ]);

  return {
    characteristics: charPart.characteristics,
    darkSecret: secretPart.darkSecret,
    currentPhase: part1.currentPhase,
    next6Months: part2.next6Months,
    roadmap: part2.roadmap,
    bhavishya: {
      health: part3.health,
      marriage: part3.marriage,
      children: part3.children,
      career: part3.career,
      wealth: part3.wealth
    },
    yogas: part4.yogas,
    doshas: part4.doshas,
    summary: part5.summary,
    ashirvada: part5.ashirvada
  };
}
